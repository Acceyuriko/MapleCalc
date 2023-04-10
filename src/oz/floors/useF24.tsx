import React, { useState, useEffect, useRef, ReactNode } from 'react';
import type { Rectangle, Worker } from 'tesseract.js';
import { Button, Space, Typography, Table, Divider, message } from 'antd';
import leven from 'leven';
import Jimp from 'jimp';
import { promisify } from '../../utils/helper';
import { Rect } from '../rect';
import { TEXT_CLUE_24 } from '../../utils/text-clue';

export const useF24 = ({
  currentFloor,
  textRect,
  onRectChange,
}: {
  currentFloor: number;
  textRect: Rectangle;
  onRectChange: (value: Rectangle) => void;
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [, setForceUpdate] = useState(0);

  const result = useRef<{
    recognize: (
      image: Jimp,
      ocr: Worker,
      rectangle: Rectangle,
    ) => Promise<void>;
    content: ReactNode;
    videoDecorator: ReactNode;
  }>();

  useEffect(() => {
    if (currentFloor !== 24) {
      setQuestion('');
      setAnswer('');
      result.current = undefined;
    } else {
      result.current = {
        recognize: async (image, ocr, rect) => {
          await promisify(image.crop.bind(image))(
            rect.left,
            rect.top,
            rect.width,
            rect.height,
          );

          await promisify(image.invert.bind(image))();
          await promisify(image.threshold.bind(image))({
            max: 100,
          });

          (document.getElementById('debug-24') as HTMLImageElement).src =
            await image.getBase64Async('image/png');

          const blob = await image.getBufferAsync('image/png');
          const res = await ocr!.recognize(blob);

          const found = TEXT_CLUE_24.reduce(
            (pre, cur, index) => {
              const distance = leven(cur.question, res.data.text);
              if (distance < pre.distance) {
                return {
                  index,
                  distance,
                };
              }
              return pre;
            },
            {
              index: -1,
              distance: Number.POSITIVE_INFINITY,
            },
          );
          if (found.index !== -1) {
            setQuestion(TEXT_CLUE_24[found.index].question);
            setAnswer(TEXT_CLUE_24[found.index].answer);
          }
        },
        content: (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <img id='debug-24' />
            <Typography.Title level={4}>question: {question}</Typography.Title>
            <Space>
              <Typography.Text>answer: {answer}</Typography.Text>
              <Button
                type='primary'
                onClick={() => {
                  navigator.clipboard.writeText(answer);
                  message.success('Successfully copied');
                }}
              >
                copy
              </Button>
            </Space>
            <Divider />
            <Table
              dataSource={TEXT_CLUE_24}
              columns={[
                {
                  title: 'question',
                  render: (row) => row.question,
                },
                {
                  title: 'answer',
                  render: (row) => row.answer,
                },
                {
                  title: 'copy',
                  render: (row) => (
                    <Button
                      type='primary'
                      onClick={() => {
                        navigator.clipboard.writeText(row.answer);
                        message.success('Successfully copied');
                      }}
                    >
                      copy
                    </Button>
                  ),
                },
              ]}
              pagination={false}
            />
          </div>
        ),
        videoDecorator: (
          <Rect
            name='floor 24 map'
            container='video-container'
            rect={textRect}
            onChange={onRectChange}
          />
        ),
      };
    }

    setForceUpdate((pre) => pre + 1);
  }, [currentFloor, answer, question, textRect, onRectChange]);

  return result;
};
