import React, { useState, useEffect, useCallback } from 'react';
import { Space, Button, Divider, Card, Typography } from 'antd';

const MONSTERS = [
  <Card
    key='1'
    cover={
      <img
        style={{ padding: 12, width: 72, height: 72 }}
        src='data:image/png;base64,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'
      />
    }
  >
    <Card.Meta title='1' />
  </Card>,
  <Card
    key='2'
    cover={
      <img
        style={{ padding: 12, width: 72, height: 72 }}
        src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAiCAYAAADVhWD8AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANJSURBVFhHvZgL1awwDISxgIW1gAUsrIW1gIW1gAUsYAELWMACN5N0SoAUuP99zDlzeLXJR9oCu9Vf0hr4v0sTL9O4ztOwTsM3m9fQ6KfyQbwjKQQ9j/0OZuw/a/dpr/pfygLPCGx3iYB99y5BhRUxd9rv27W+/2NpYB9w+L5zQBrtrHmllYhAcAO8ia3vc6BTwOH7cYH2RvuoDwyAPujj+t0qJzj6GJAlByx8bF/Vdd6v6yqDuaGCL7VS2J+myXdU+5Ifry3LkvePqgWulvOwtnn3ua04VOpqMN7U7573msV1/bI272GtPqPZ+oSyniLs+2Oql6g6DK09Q6hSe2oRa1+0A4xaYLC1vidph5JysLYz37SnJiE5gzg3ed6dlJMcrdcagEhVUGLcmZwb5VokVGOQa8Oc5lMrcwV9kZwmkOUtig32BgwDbGMewsO5H9oThOd4Xn09f7zkYbhbATtfXdNqMCFAMIk/slK7eWvzkiV/M5mPstqrMABzhljkCYxt9ZIlj4SoAO+W2zTHqm5ZX18Zto/AwAZgcOhvx5cyhiypf4LBqwDX1QriKsEKaFUMpull6BROgLVtqgja4dhiFWX5swzEYAYFwkMN7TIEjQQHGK2GHgs4KuFh4OcwG4h6serkOeNBWBXCwEcYzB8FkJt5AAOCpAMILZ8aGQgJmFgCN73MjROMQCqMVKpuDAQTWNulKhUkCaEAgvbVwZ06GNlsSTJM2qcxd9CG0AUYSUYFELSDeb3kLplEgqMysrsBaTUA7IAIQshrmADA28HgW0YnM4KmOSMLZG0JBCMZhocwAMvVku0fwYgJo9XhSxTBEwBg4DyHYD+/1OVlLUlMPhGWcgyDJW7LfKsO7titqMgE2b8mTpIkkD1pcUwfQWAPA499eqYgEYYAy9lDcHkrSFqFFj9UmLRot7y99buHSSPfVISKk17YV4bG97F+avJNz1cAIR6AQGHCO5+A5GcMhqxp0ucmAdRpKP8VjLw19zDJ+DGH31C60jaA/NsqHRcVJ3vgCAZGhZh871yhS4XJLu0egJEN6AyFXJayrFMitT93cASg1j8DihC3IJQ2jhKrC0s6G7/D5SG4VcO2jIsEP5EP8Dd8oar6BeeK4AiiQnn0AAAAAElFTkSuQmCC'
      />
    }
  >
    <Card.Meta title='2' />
  </Card>,
  <Card
    key='3'
    cover={
      <img
        style={{ padding: 12, width: 72, height: 72 }}
        src='data:image/png;base64,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'
      />
    }
  >
    <Card.Meta title='3' />
  </Card>,
  <Card
    key='4'
    cover={
      <img
        style={{ padding: 12, width: 72, height: 72 }}
        src='data:image/png;base64,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'
      />
    }
  >
    <Card.Meta title='4' />
  </Card>,
];

export const useF36 = ({ currentFloor }: { currentFloor: number }) => {
  const [sequence, setSequence] = useState<typeof MONSTERS>([]);

  const push = useCallback((index: string | number) => {
    const idx = typeof index === 'number' ? index : Number.parseInt(index);
    setSequence((pre) => {
      return [...pre, MONSTERS[idx - 1]];
    });
  }, []);

  const pop = useCallback(() => {
    setSequence((pre) => {
      return pre.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    if (currentFloor !== 36) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        push(e.key);
      } else if (['Delete', 'Backspace'].includes(e.key)) {
        pop();
      } else if (['Escape'].includes(e.key)) {
        setSequence([]);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [currentFloor, push, pop]);

  if (currentFloor !== 36) {
    return null;
  }

  return {
    content: (
      <Space direction='vertical' style={{ display: 'flex' }}>
        <Typography.Paragraph>
          可以使用键盘
          <Typography.Text code>1</Typography.Text>,
          <Typography.Text code>2</Typography.Text>,
          <Typography.Text code>3</Typography.Text>,
          <Typography.Text code>4</Typography.Text> 追加怪物到序列中。
          <Typography.Text code>Delete</Typography.Text>或
          <Typography.Text code>Backspace</Typography.Text>删除最后一个怪物。
          <Typography.Text code>Escape</Typography.Text> 清空序列。
        </Typography.Paragraph>
        <Space>
          {MONSTERS.map((monster, index) => {
            return (
              <div
                key={index}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSequence((pre) => {
                    return [...pre, monster];
                  });
                }}
              >
                {monster}
              </div>
            );
          })}
        </Space>
        <Button
          type='primary'
          danger
          onClick={() => {
            setSequence([]);
          }}
        >
          Clear
        </Button>
        <Space>
          {sequence.map((monster, index) => (
            <React.Fragment key={index}>
              <div>{monster}</div>
              {(index + 1) % 4 === 0 && (
                <div className='spacer' style={{ width: 48 }} />
              )}
            </React.Fragment>
          ))}
        </Space>
        <Divider />
      </Space>
    ),
  };
};
