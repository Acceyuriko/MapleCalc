import React from 'react';
import type { Rectangle } from 'tesseract.js';
import { Slider, Form, Typography } from 'antd';
import { Rect } from '../rect';
import FLOOR_48 from '../../images/floor48.png';

export const useF48 = ({
  currentFloor,
  map,
  videoScale,
  onSliderChange,
  onRectChange,
}: {
  currentFloor: number;
  map: Rectangle;
  videoScale: number;
  onSliderChange: (value: number) => void;
  onRectChange: (value: Rectangle) => void;
}) => {
  const content = (
    <>
      <Form.Item label='scale ratio'>
        <Slider
          style={{ width: 320 }}
          defaultValue={videoScale}
          step={0.1}
          min={1}
          max={10}
          onChange={onSliderChange}
        />
      </Form.Item>
      <Form.Item>
        <Typography.Paragraph>
          <ul>
            <li>需调节小地图上的红框，使其与冒冒的小地图对齐。</li>
            <li>
              调节 <Typography.Text mark>scale ratio</Typography.Text>{' '}
              可以调节视频的放大倍率。
            </li>
          </ul>
        </Typography.Paragraph>
      </Form.Item>
    </>
  );

  const videoDecorator = (
    <>
      <Rect
        name='floor 48 map'
        container='video-container'
        rect={map}
        onChange={onRectChange}
      />
      <img className='map' src={FLOOR_48} style={{ ...map }} />
    </>
  );

  if (currentFloor !== 48) {
    return null;
  }

  return {
    content,
    videoStyle: {
      transform: `scale(${videoScale})`,
    },
    videoDecorator,
  };
};
