import React, { useCallback } from 'react';
import { Rectangle } from 'tesseract.js';
import { Popover, InputNumber, Form } from 'antd';
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
  const onTopChange = useCallback(
    (value: number) => {
      const nextTop = Math.max(0, Math.min(value, top + height - LINE_WIDTH));

      onChange({
        top: nextTop,
        left,
        width,
        height: height - (nextTop - top),
      });
    },
    [onChange, top, left, width, height],
  );

  const onLeftChange = useCallback(
    (value: number) => {
      const nextLeft = Math.max(0, Math.min(value, left + width - LINE_WIDTH));

      onChange({
        top,
        left: nextLeft,
        width: width - (nextLeft - left),
        height,
      });
    },
    [onChange, top, left, width, height],
  );

  const onHeightChange = useCallback(
    (value: number) => {
      const nextHeight = Math.max(
        0,
        Math.min(
          document.getElementById(container)!.offsetHeight - LINE_WIDTH,
          value,
        ),
      );
      onChange({
        top,
        left,
        width,
        height: nextHeight,
      });
    },
    [container, onChange, top, left, width],
  );

  const onWidthChange = useCallback(
    (value: number) => {
      const nextWidth = Math.max(
        0,
        Math.min(
          document.getElementById(container)!.offsetWidth - LINE_WIDTH,
          value,
        ),
      );
      onChange({
        top,
        left,
        width: nextWidth,
        height,
      });
    },
    [container, height, left, onChange, top],
  );

  return (
    <Popover
      trigger='click'
      content={
        <Form layout='inline' title={name}>
          <Form.Item label='top'>
            <InputNumber
              value={top}
              onChange={(value) => {
                onTopChange(value!);
              }}
            />
          </Form.Item>
          <Form.Item label='left'>
            <InputNumber
              value={left}
              onChange={(value) => {
                onLeftChange(value!);
              }}
            />
          </Form.Item>
          <Form.Item label='width'>
            <InputNumber
              value={width}
              onChange={(value) => {
                onWidthChange(value!);
              }}
            />
          </Form.Item>
          <Form.Item label='height'>
            <InputNumber
              value={height}
              onChange={(value) => {
                onHeightChange(value!);
              }}
            />
          </Form.Item>
        </Form>
      }
    >
      <div className='rect' style={{ top, left, width, height }}>
        <div
          className='line top'
          style={{ left: 0, top: -LINE_WIDTH, width, height: LINE_WIDTH }}
          onMouseDown={(e) => {
            const start = e.clientY;
            const onMouseMove = (e: MouseEvent) => {
              onTopChange(top + e.clientY - start);
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
              onHeightChange(height + e.clientY - start);
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
              onLeftChange(left + e.clientX - start);
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
              onWidthChange(width + e.clientX - start);
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
    </Popover>
  );
};
