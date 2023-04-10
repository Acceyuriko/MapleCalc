import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Spin, message } from 'antd';
import type { Rectangle, Worker } from 'tesseract.js';
import Jimp from 'jimp/browser/lib/jimp';
import { Rect } from './rect';
import { useF23 } from './floors/useF23';
import { useF24 } from './floors/useF24';
import { useF39 } from './floors/useF39';
import { promisify } from '../utils/helper';

import './index.less';

const KEY_RECT_SETTINGS = 'oz_rect_settings';
const TIMEOUT = 1000;
const VIDEO_WIDTH = 1366;

export interface RectSettings {
  floor: Rectangle;
  videoScale: number;
  map23: Rectangle;
  text24: Rectangle;
  text39: Rectangle;
}

export const OZ = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureFrameTimeout = useRef(0);

  const [stream, setStream] = useState<MediaStream>();
  const [ocr, setOcr] = useState<Worker>();

  const [rectSettings, setRectSettings] = useState<RectSettings>(
    localStorage.getItem(KEY_RECT_SETTINGS)
      ? JSON.parse(localStorage.getItem(KEY_RECT_SETTINGS)!)
      : {
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
        },
  );
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

  const startCapture = useCallback(() => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: false })
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
    canvas.width = VIDEO_WIDTH;
    canvas.height = (video.videoHeight * VIDEO_WIDTH) / video.videoWidth;

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

          (document.getElementById('debug-floor') as HTMLImageElement).src =
            await cloned.getBase64Async('image/png');

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
          captureFrameTimeout.current = setTimeout(captureFrame, TIMEOUT);
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
      </div>
    );
  }

  return (
    <div className='oz'>
      <div className='operations'>
        <div className='floor'>
          Current Floor: {currentFloor} <img id='debug-floor' />
        </div>
        {f23?.slider}
        {f24.current?.content}
        {f39.current?.content}
        <Button onClick={stopCapture}>stop capture</Button>
      </div>
      <div
        id='video-container'
        className='video-container'
        style={{
          ...f23?.videoStyle,
        }}
      >
        <video
          ref={videoRef}
          style={{ width: VIDEO_WIDTH }}
          autoPlay
          onPlay={onVideoStart}
        />
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
      </div>
      <canvas id='canvas' ref={canvasRef} />
    </div>
  );
};
