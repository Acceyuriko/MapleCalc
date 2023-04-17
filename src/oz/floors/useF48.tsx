import React from 'react';
import type { Rectangle } from 'tesseract.js';
import { Slider, Form } from 'antd';
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
  const slider = (
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
    slider,
    videoStyle: {
      transform: `scale(${videoScale})`,
    },
    videoDecorator,
  };
};
