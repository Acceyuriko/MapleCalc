import React from 'react';
import type { Rectangle } from 'tesseract.js';
import { Tooltip } from 'antd';
import './index.less';

export interface props {
  name: string;
  rect: Rectangle;
  onChange: (rect: Rectangle) => void;
  container: string;
}

const LINE_WIDTH = 2;

export const Rect = ({
  name,
  rect: { top, left, width, height },
  onChange,
  container,
}: props) => {
  return (
    <Tooltip title={name}>
      <div className='rect' style={{ top, left, width, height }}>
        <div
          className='line top'
          style={{ left: 0, top: -LINE_WIDTH, width, height: LINE_WIDTH }}
          onMouseDown={(e) => {
            const start = e.clientY;
            const onMouseMove = (e: MouseEvent) => {
              const nextTop = Math.max(
                0,
                Math.min(top + e.clientY - start, top + height - LINE_WIDTH),
              );
              onChange({
                top: nextTop,
                left,
                width,
                height: height - (nextTop - top),
              });
            };

            const onMouseUp = () => {
              document.removeEventListener('mouseup', onMouseUp);
              document.removeEventListener('mousemove', onMouseMove);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
        <div
          className='line bottom'
          style={{ left: 0, top: height, width, height: LINE_WIDTH }}
          onMouseDown={(e) => {
            const start = e.clientY;
            const onMouseMove = (e: MouseEvent) => {
              const nextHeight = Math.max(
                0,
                Math.min(
                  document.getElementById(container)!.offsetHeight - LINE_WIDTH,
                  height + e.clientY - start,
                ),
              );
              onChange({
                top,
                left,
                width,
                height: nextHeight,
              });
            };

            const onMouseUp = () => {
              document.removeEventListener('mouseup', onMouseUp);
              document.removeEventListener('mousemove', onMouseMove);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
        <div
          className='line left'
          style={{ left: -LINE_WIDTH, top: 0, height, width: LINE_WIDTH }}
          onMouseDown={(e) => {
            const start = e.clientX;
            const onMouseMove = (e: MouseEvent) => {
              const nextLeft = Math.max(
                0,
                Math.min(left + e.clientX - start, left + width - LINE_WIDTH),
              );
              onChange({
                top,
                left: nextLeft,
                width: width - (nextLeft - left),
                height,
              });
            };

            const onMouseUp = () => {
              document.removeEventListener('mouseup', onMouseUp);
              document.removeEventListener('mousemove', onMouseMove);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
        <div
          className='line right'
          style={{ left: width, top: 0, height, width: LINE_WIDTH }}
          onMouseDown={(e) => {
            const start = e.clientX;
            const onMouseMove = (e: MouseEvent) => {
              const nextWidth = Math.max(
                0,
                Math.min(
                  document.getElementById(container)!.offsetWidth - LINE_WIDTH,
                  width + e.clientX - start,
                ),
              );
              onChange({
                top,
                left,
                width: nextWidth,
                height,
              });
            };

            const onMouseUp = () => {
              document.removeEventListener('mouseup', onMouseUp);
              document.removeEventListener('mousemove', onMouseMove);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
      </div>
    </Tooltip>
  );
};
