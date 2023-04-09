import React from 'react';
import type { Rectangle } from 'tesseract.js';
import { Slider } from 'antd';
import { Rect } from '../rect';
import FLOOR_23 from '../../images/floor23.png';

export const useF23 = ({
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
    <Slider
      style={{ width: 320 }}
      defaultValue={videoScale}
      step={0.1}
      min={1}
      max={10}
      onChange={onSliderChange}
    />
  );

  const videoDecorator = (
    <>
      <Rect
        name='floor 23 map'
        container='video-container'
        rect={map}
        onChange={onRectChange}
      />
      <img className='map' src={`${FLOOR_23}?_=1`} style={{ ...map }} />
    </>
  );

  if (currentFloor !== 23) {
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
