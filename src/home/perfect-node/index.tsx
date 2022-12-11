import React, { useState } from 'react';
import { uniq, groupBy } from 'lodash';
import { Row, Col, List, Input, Button, message } from 'antd';

import './index.less';

export interface Props {
  nodes: string[][];
  onNodesChange: (nodes: string[][]) => void;
}

export const PerfectNode = ({ nodes, onNodesChange }: Props) => {
  const [input, setInput] = useState(
    nodes.map((node) => node.join(', ')).join('\n'),
  );
  const [perfectNodes, setPerfectNodes] = useState<string[][]>();

  return (
    <div className='perfect-node'>
      <Row gutter={[16, 16]}>
        <Col>
          <Input.TextArea
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            style={{ marginTop: 12 }}
            onClick={() => {
              const lines = input.trim().split('\n');
              const newNodes: string[][] = [];
              for (const line of lines) {
                const skills = line.split(',').map((i) => i.trim());
                if (uniq(skills).length !== 3) {
                  message.error(`错误的核心：${skills.join(',')}`);
                  return;
                }
                newNodes.push(skills);
              }
              onNodesChange(newNodes);
              setPerfectNodes(undefined);

              const totalSkills = uniq(newNodes.flat()).length;

              const groups = Object.values(
                groupBy(newNodes, (node) => node[0]),
              );

              const path: string[][] = [];

              const traverse = (
                count: Record<string, number>,
                remainGroups: string[][][],
              ) => {
                if (remainGroups.length === 0) {
                  return false;
                }
                for (let i = 0; i < remainGroups.length; i++) {
                  traverse_node: for (const node of remainGroups[i]) {
                    const countForNodeLoop = { ...count };
                    for (const skill of node) {
                      if (countForNodeLoop[skill] === undefined) {
                        countForNodeLoop[skill] = 0;
                      }
                      countForNodeLoop[skill]++;
                      if (countForNodeLoop[skill] > 2) {
                        continue traverse_node;
                      }
                    }
                    const counts = Object.values(countForNodeLoop);
                    if (
                      counts.length === totalSkills &&
                      counts.every((i) => i === 2)
                    ) {
                      path.unshift(node);
                      return true;
                    }
                    if (
                      traverse(
                        { ...countForNodeLoop },
                        remainGroups.slice(i + 1),
                      )
                    ) {
                      path.unshift(node);
                      return true;
                    }
                  }
                }
              };

              if (traverse({}, groups.slice(0))) {
                message.info('计算完成');
                setPerfectNodes(path);
              } else {
                message.info('未找到完美核心');
              }
            }}
          >
            计算
          </Button>
        </Col>
        <Col>
          <List
            bordered
            dataSource={perfectNodes}
            renderItem={(item) => <List.Item>{item.join(', ')}</List.Item>}
          />
        </Col>
      </Row>
    </div>
  );
};
