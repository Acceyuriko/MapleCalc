import React, { useEffect, useState, useRef, ReactNode } from 'react';
import Jimp from 'jimp';
import type { Rectangle, Worker } from 'tesseract.js';
import leven from 'leven';
import { Typography, Space, Table, Divider } from 'antd';
import { promisify } from '../../utils/helper';
import { Rect } from '../rect';
import { TEXT_CLUE_39 } from '../../utils/text-clue';

export const useF39 = ({
  currentFloor,
  textRect,
  onRectChange,
}: {
  currentFloor: number;
  textRect: Rectangle;
  onRectChange: (value: Rectangle) => void;
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<ReactNode>(null);
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
    if (currentFloor !== 39) {
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

          await promisify(image.scale.bind(image))(3);

          (document.getElementById('debug-39') as HTMLImageElement).src =
            await image.getBase64Async('image/png');

          const blob = await image.getBufferAsync('image/png');
          const {
            data: { text },
          } = await ocr!.recognize(blob);
          const lines = text.split('\n').filter((i) => i.trim());
          const firstAnswerIndex = lines.findIndex((i) => /^\d/.test(i));
          if (firstAnswerIndex === -1) {
            return;
          }
          const question = lines.slice(0, firstAnswerIndex).join(' ');
          const matched = TEXT_CLUE_39.reduce(
            (pre, cur, index) => {
              const dist = leven(cur.question, question);
              if (dist < pre.distance) {
                return {
                  index,
                  distance: dist,
                };
              }
              return pre;
            },
            {
              index: -1,
              distance: Number.POSITIVE_INFINITY,
            },
          );

          if (matched.index === -1) {
            return;
          }
          setQuestion(TEXT_CLUE_39[matched.index].question);

          const options = [
            lines[firstAnswerIndex] || '',
            lines[firstAnswerIndex + 1] || '',
            lines[firstAnswerIndex + 2] || '',
            lines[firstAnswerIndex + 3] || '',
          ];
          const matchedAnswer = options.reduce(
            (pre, cur, index) => {
              const next = { ...pre };
              TEXT_CLUE_39[matched.index].answer.forEach((i) => {
                const dist = leven(cur, i);
                if (dist < next.distance) {
                  next.index = index;
                  next.distance = dist;
                }
              });

              return next;
            },
            {
              index: -1,
              distance: Number.POSITIVE_INFINITY,
            },
          );

          setAnswer(
            options.map((i, index) => (
              <React.Fragment key={i}>
                <Typography.Text mark={index === matchedAnswer.index}>
                  {i}
                </Typography.Text>
                <br />
              </React.Fragment>
            )),
          );
        },
        content: (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <img style={{ maxWidth: '100%' }} id='debug-39' />
            <Typography.Title level={4}>{question}</Typography.Title>
            <Space>{answer}</Space>
            <Divider />
            <Table
              dataSource={TEXT_CLUE_39}
              rowKey={(row) => row.question}
              columns={[
                {
                  title: 'question',
                  render: (row) => row.question,
                },
                {
                  title: 'answer',
                  render: (row: { answer: string[] }) => (
                    <Space>
                      {row.answer.map((i) => (
                        <div key={i}>{i}</div>
                      ))}{' '}
                    </Space>
                  ),
                },
              ]}
              pagination={false}
            />
          </div>
        ),
        videoDecorator: (
          <Rect
            name='floor 39 map'
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
