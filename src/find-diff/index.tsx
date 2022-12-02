import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Spin, Typography, Image, Slider, Form, message } from 'antd';
import Jimp from 'jimp/browser/lib/jimp';

import './index.less';

const { Paragraph, Text } = Typography;

const red = Jimp.rgbaToInt(255, 0, 0, 255);
const green = Jimp.rgbaToInt(0, 255, 0, 255);

export const FindDiff = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<Jimp>();
  const [size, setSize] = useState(6);
  const [range, setRange] = useState(0.1);
  const [threshold, setThreshold] = useState(20);
  const debounceRef = useRef(0);

  const diff = useCallback(() => {
    if (!image) {
      return;
    }
    setLoading(true);
    const rightStart = Math.floor(image.bitmap.width * (0.5 - range));
    const rightEnd = Math.floor(image.bitmap.width * (0.5 + range));
    const mid = Math.floor(image.bitmap.width / 2);

    let i = 0;
    let j = 0;
    let k = rightStart;
    let match = true;
    match_start: for (i = 0; i < image.bitmap.height - size; i++) {
      for (j = 0; j < rightStart / 2 - size; j++) {
        for (
          k = mid;
          k >= rightStart && k < rightEnd;
          k >= mid ? (k = mid - (k - mid + 1)) : (k = mid + mid - k)
        ) {
          match = true;
          match_next: for (let m = 0; m < size; m++) {
            for (let n = 0; n < size; n++) {
              const leftColor = Jimp.intToRGBA(
                image.getPixelColor(j + n, i + m),
              );
              const rightColor = Jimp.intToRGBA(
                image.getPixelColor(k + n, i + m),
              );
              const difference =
                Math.abs(leftColor.r - rightColor.r) +
                Math.abs(leftColor.g - rightColor.g) +
                Math.abs(leftColor.b - rightColor.b);

              if (difference > threshold) {
                match = false;
                break match_next;
              }
            }
          }
          if (match) {
            break match_start;
          }
        }
      }
    }

    if (match) {
      const processed = image.clone();
      for (let m = 0; m + i < image.bitmap.height; m++) {
        for (let n = 0; n + k < image.bitmap.width; n++) {
          const leftColor = Jimp.intToRGBA(image.getPixelColor(j + n, i + m));
          const rightColor = Jimp.intToRGBA(image.getPixelColor(k + n, i + m));
          const r = Math.max(leftColor.r - rightColor.r, 0);
          const g = Math.max(leftColor.g - rightColor.g, 0);
          const b = Math.max(leftColor.b - rightColor.b, 0);

          if (r + g + b > threshold) {
            for (
              let x = -3;
              x < 3 && x + i + m >= 0 && x + i + m < image.bitmap.height;
              x++
            ) {
              for (
                let y = -3;
                y < 3 && y + j + n >= 0 && y + k + n < image.bitmap.width;
                y++
              ) {
                processed.setPixelColor(red, y + j + n, x + i + m);
                processed.setPixelColor(red, y + k + n, x + i + m);
              }
            }
          }
        }
      }

      for (let m = 0; m < size; m++) {
        for (let n = 0; n < size; n++) {
          processed.setPixelColor(green, j + n, i + m);
          processed.setPixelColor(green, k + n, i + m);
        }
      }

      processed.getBase64Async('image/png').then((base64) => {
        setLoading(false);
        setResult(base64);
      });
    } else {
      message.error('did not find the starting point');
    }
  }, [image, range, size, threshold]);

  useEffect(() => {
    const onPaste: EventListener = (e) => {
      const file = (e as ClipboardEvent).clipboardData?.files?.[0];
      if (!file) {
        message.error('invalid file');
        return;
      }
      if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
        message.error(`invalid file type, ${file.type}`);
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setUrl(imageUrl);
      setLoading(true);
      Jimp.read({
        url: imageUrl,
      })
        .then((image) => {
          setImage(image);
        })
        .catch((e) => {
          message.error(`failed to read image, ${e.message}`);
        });
    };
    window.addEventListener('paste', onPaste);

    return () => {
      window.removeEventListener('paste', onPaste);
    };
  }, [diff]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      diff();
    }, 500);
  }, [diff]);

  return (
    <div className='find-diff'>
      <Paragraph>
        <Text>粘贴截图到这里</Text>
      </Paragraph>
      <Paragraph>
        <Form layout='inline'>
          <Form.Item label={`块大小(${size})`}>
            <Slider
              style={{ width: 200 }}
              min={1}
              max={10}
              step={1}
              value={size}
              onChange={(value) => {
                setSize(value);
              }}
            />
          </Form.Item>
          <Form.Item label={`范围(${range})`}>
            <Slider
              style={{ width: 200 }}
              min={0.01}
              max={0.2}
              step={0.01}
              value={range}
              onChange={(value) => {
                setRange(value);
              }}
            />
          </Form.Item>
          <Form.Item label={`阈值(${threshold})`}>
            <Slider
              style={{ width: 200 }}
              min={10}
              max={30}
              step={1}
              value={threshold}
              onChange={(value) => {
                setThreshold(value);
              }}
            />
          </Form.Item>
        </Form>
      </Paragraph>
      <Paragraph>
        {loading ? <Spin size='large' /> : <Image src={result} />}
      </Paragraph>
      <Paragraph>{url && <Image src={url} />}</Paragraph>
    </div>
  );
};
