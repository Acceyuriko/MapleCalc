import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Spin, Typography, Form, message, Slider } from 'antd';
import type { Rectangle, Worker } from 'tesseract.js';
import Jimp from 'jimp/browser/lib/jimp';
import { Rect } from './rect';
import { useF22 } from './floors/useF22';
import { useF23 } from './floors/useF23';
import { useF24 } from './floors/useF24';
import { useF36 } from './floors/useF36';
import { useF39 } from './floors/useF39';
import { useF48 } from './floors/useF48';
import { promisify } from '../utils/helper';

import './index.less';

const KEY_RECT_SETTINGS = 'oz_rect_settings';

const { Paragraph, Text } = Typography;

export interface RectSettings {
  rcInterval: number;
  floor: Rectangle;
  videoScale: number;
  map23: Rectangle;
  text24: Rectangle;
  text39: Rectangle;
  map48: Rectangle;
}

export const OZ = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureFrameTimeout = useRef(0);

  const [stream, setStream] = useState<MediaStream>();
  const [ocr, setOcr] = useState<Worker>();
  const [videoVisible, setVideoVisible] = useState(true);

  const [rectSettings, setRectSettings] = useState<RectSettings>({
    rcInterval: 1000,
    floor: {
      top: 58,
      left: 705,
      width: 84,
      height: 25,
    },
    videoScale: 5,
    map23: {
      top: 64,
      left: 26,
      width: 278,
      height: 126,
    },
    text24: {
      top: 233,
      left: 290,
      width: 900,
      height: 28,
    },
    text39: {
      top: 313,
      left: 580,
      width: 342,
      height: 171,
    },
    map48: {
      top: 37,
      left: 10,
      width: 258,
      height: 152,
    },
    ...(localStorage.getItem(KEY_RECT_SETTINGS)
      ? JSON.parse(localStorage.getItem(KEY_RECT_SETTINGS)!)
      : {}),
  });
  const rectSettingsRef = useRef(rectSettings);

  const [currentFloor, reactSetCurrentFloor] = useState(0);
  const currentFloorRef = useRef(0);
  const setCurrentFloor = useCallback((value: number) => {
    if (currentFloorRef.current !== value) {
      currentFloorRef.current = value;
      reactSetCurrentFloor(value);
    }
  }, []);

  const onRectSettingsChange = useCallback((value: Partial<RectSettings>) => {
    setRectSettings((pre) => {
      const next = {
        ...pre,
        ...value,
      };
      rectSettingsRef.current = next;
      localStorage.setItem(KEY_RECT_SETTINGS, JSON.stringify(next));
      return next;
    });
  }, []);

  const f22 = useF22({
    currentFloor,
  });

  const f23 = useF23({
    currentFloor,
    map: rectSettings.map23,
    videoScale: rectSettings.videoScale,
    onSliderChange: (value) => {
      onRectSettingsChange({ videoScale: value });
    },
    onRectChange: (value) => {
      onRectSettingsChange({ map23: value });
    },
  });

  const f24 = useF24({
    currentFloor,
    textRect: rectSettings.text24,
    onRectChange: useCallback(
      (value) => {
        onRectSettingsChange({ text24: value });
      },
      [onRectSettingsChange],
    ),
  });

  const f36 = useF36({
    currentFloor,
  });

  const f39 = useF39({
    currentFloor,
    textRect: rectSettings.text39,
    onRectChange: useCallback(
      (value) => {
        onRectSettingsChange({ text39: value });
      },
      [onRectSettingsChange],
    ),
  });

  const f48 = useF48({
    currentFloor,
    map: rectSettings.map48,
    videoScale: rectSettings.videoScale,
    onSliderChange: (value) => {
      onRectSettingsChange({ videoScale: value });
    },
    onRectChange: (value) => {
      onRectSettingsChange({ map48: value });
    },
  });

  const startCapture = useCallback(() => {
    navigator.mediaDevices
      .getDisplayMedia({ video: { frameRate: 60 }, audio: false })
      .then((s) => {
        setStream(s);
        const track = s.getVideoTracks()[0];

        console.log('track', {
          settings: track.getSettings(),
          constraints: track.getConstraints(),
        });
      })
      .catch((e) => {
        console.error('failed to capture stream', e);
        message.error(
          `failed to capture stream, ${
            (e as Error).message || JSON.stringify(e)
          }`,
        );
      });
  }, []);

  const stopCapture = useCallback(() => {
    if (!stream) {
      return;
    }
    stream.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    clearTimeout(captureFrameTimeout.current);
    setStream(undefined);
  }, [stream]);

  useEffect(() => {
    if (!stream) {
      return;
    }
    videoRef.current!.srcObject = stream;
  }, [stream, ocr]);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  useEffect(() => {
    window.Tesseract.createWorker({
      logger: () => undefined,
    })
      .then(async (worker) => {
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        await worker.setParameters({
          tessedit_char_whitelist: ` 1234567890abcdefghijklmnopqrstuvwxvyABCDEFGHIJKLMNOPQRSTUVWXVY,.?'":-!`,
        });
        setOcr(worker);
      })
      .catch((e) => {
        console.error('failed to initialize ocr', e);
        message.error(
          `failed to initialize ocr, ${
            (e as Error).message || JSON.stringify(e)
          }`,
        );
      });
  }, []);

  useEffect(() => {
    return () => {
      ocr?.terminate();
      clearTimeout(captureFrameTimeout.current);
    };
  }, [ocr]);

  const onVideoStart = useCallback(() => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    video.style.width = canvas.width + 'px';
    video.style.height = canvas.height + 'px';
    video.parentElement!.style.width = video.style.width;
    video.parentElement!.style.height = video.style.height;

    const captureFrame = () => {
      canvas
        .getContext('2d')!
        .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      Jimp.read(canvas.toDataURL())
        .then(async (image) => {
          const cloned = await promisify(image.clone.bind(image))();
          await promisify(cloned.crop.bind(cloned))(
            rectSettingsRef.current.floor.left,
            rectSettingsRef.current.floor.top,
            rectSettingsRef.current.floor.width,
            rectSettingsRef.current.floor.height,
          );

          await promisify(cloned.scale.bind(cloned))(2);
          await promisify(cloned.threshold.bind(cloned))({
            max: 150,
          });

          const debugFloorImg = document.getElementById(
            'debug-floor',
          ) as HTMLImageElement;
          if (debugFloorImg) {
            debugFloorImg.src = await cloned.getBase64Async('image/png');
          }

          const blob = await cloned.getBufferAsync('image/png');
          const res = await ocr!.recognize(blob);
          const match = res.data.text.match(/Undersea.*?(\d+)/i);
          if (!match?.[1]) {
            return;
          }

          const floor = Number.parseInt(match[1]);
          if (currentFloorRef.current !== floor) {
            setCurrentFloor(floor);
          }
          if (currentFloorRef.current === 24) {
            const cloned = await promisify(image.clone.bind(image))();
            await f24.current?.recognize(
              cloned,
              ocr!,
              rectSettingsRef.current.text24,
            );
          }
          if (currentFloorRef.current === 39) {
            const cloned = await promisify(image.clone.bind(image))();
            await f39.current?.recognize(
              cloned,
              ocr!,
              rectSettingsRef.current.text39,
            );
          }
        })
        .catch((e: Error) => {
          console.error('failed to recognize', e);
          message.error(
            `failed to recognize video, ${e.message || JSON.stringify(e)}`,
          );
        })
        .finally(() => {
          if (videoRef.current?.srcObject) {
            captureFrameTimeout.current = setTimeout(
              captureFrame,
              rectSettingsRef.current.rcInterval,
            );
          }
        });
    };
    captureFrame();
  }, [ocr, setCurrentFloor, f24, f39]);

  if (!ocr) {
    return (
      <div className='oz'>
        <Spin size='large' />
        Loading OCR
      </div>
    );
  }

  if (!stream) {
    return (
      <div className='oz'>
        <Button onClick={startCapture}>start capture</Button>
        <Paragraph>
          点击 <Text code>start capture</Text>， 选择冒冒分享，开始体验。
        </Paragraph>
        <Paragraph>
          <ul>
            <li>
              视频上有用于识别楼层的红框，拖动红框边缘以选中楼层，包含{' '}
              <Text code>Undersea 99F</Text> 字样即可。
              点击红框边缘，会出现编辑框，用于微调红框位置。
            </li>
            <li>
              拖动<Text code> recognization interval </Text>
              滑块，调整识别频率，单位是毫秒，时间越短识别响应越快，消耗资源越多，请量力而行。
            </li>
          </ul>
        </Paragraph>
      </div>
    );
  }

  return (
    <div className='oz'>
      <div className='operations'>
        <div className='floor'>
          Current Floor: {currentFloor} <img id='debug-floor' />
        </div>
        {f22?.content}
        {f23?.content}
        {f24.current?.content}
        {f36?.content}
        {f39.current?.content}
        {f48?.content}
        <Form.Item label='recognization interval'>
          <Slider
            style={{ width: '100%' }}
            min={100}
            max={3000}
            value={rectSettings.rcInterval}
            onChange={(value) => {
              onRectSettingsChange({
                rcInterval: value,
              });
            }}
          />
        </Form.Item>
        <Button onClick={stopCapture}>stop capture</Button>
      </div>
      {stream && (
        <div>
          <Button
            onClick={() => {
              setVideoVisible((pre) => !pre);
            }}
          >
            {videoVisible ? 'hide' : 'show'} video
          </Button>
        </div>
      )}
      <div
        id='video-container'
        className='video-container'
        style={{
          ...f23?.videoStyle,
          ...f48?.videoStyle,
          display: videoVisible ? 'flex' : 'none',
        }}
      >
        <video ref={videoRef} autoPlay onPlay={onVideoStart} />
        <Rect
          name='floor rectangle'
          container='video-container'
          rect={rectSettings.floor}
          onChange={(next) => {
            onRectSettingsChange({
              floor: next,
            });
          }}
        />
        {f23?.videoDecorator}
        {f24.current?.videoDecorator}
        {f39.current?.videoDecorator}
        {f48?.videoDecorator}
      </div>
      <canvas id='canvas' ref={canvasRef} />
    </div>
  );
};
