import React, { useState, useCallback } from 'react';
import { Row, Col, Tabs, Select, Modal, Form, Input, Button } from 'antd';
import { PerfectNode } from './perfect-node';

import './index.less';

export interface Charactor {
  id: number;
  name: string;
  nodes?: string[][];
}

const KEY_CHARACTOR = 'charactors';

export const Home = () => {
  const [form] = Form.useForm();

  const [charactors, reactSetCharactors] = useState<Charactor[]>(
    JSON.parse(localStorage.getItem(KEY_CHARACTOR) ?? '[]'),
  );
  const [charactor, setCharactor] = useState<Charactor | undefined>(
    charactors[0],
  );
  const [isChractorModalVisible, setIsCharactorModalVisible] = useState(false);

  const setCharactors = useCallback(
    (charactors: Charactor[]) => {
      localStorage.setItem(KEY_CHARACTOR, JSON.stringify(charactors));
      reactSetCharactors(charactors);
      if (charactors.length === 0) {
        setCharactor(undefined);
      } else if (!charactor) {
        setCharactor(charactors[0]);
      }
    },
    [reactSetCharactors, setCharactor, charactor],
  );

  return (
    <div className='home'>
      <Row gutter={16}>
        <Col>
          <Select
            style={{ width: 240 }}
            onChange={(value) => {
              setCharactor(charactors.find((i) => i.id === value));
            }}
            value={charactor?.id}
          >
            {charactors.map((i) => (
              <Select.Option key={i.id} value={i.id}>
                {i.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button
            onClick={() => {
              setIsCharactorModalVisible(true);
            }}
          >
            创建角色
          </Button>
        </Col>
        {charactor && (
          <Col>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确定要删除角色吗?',
                  cancelText: '取消',
                  okText: '确定',
                  onOk: (close) => {
                    const index = charactors.findIndex(
                      (i) => i.id === charactor.id,
                    );
                    if (index !== -1) {
                      const next = [...charactors];
                      next.splice(index, 1);
                      setCharactors(next);
                    }
                    close();
                  },
                });
              }}
            >
              删除角色
            </Button>
          </Col>
        )}
      </Row>
      {charactor && (
        <Tabs
          defaultActiveKey='perfect-node'
          items={[
            {
              label: '完美核心',
              key: 'perfect-node',
              children: (
                <PerfectNode
                  nodes={charactor.nodes ?? []}
                  onNodesChange={(nodes) => {
                    charactor.nodes = nodes;
                    setCharactors([...charactors]);
                  }}
                />
              ),
            },
          ]}
        />
      )}
      <Modal
        destroyOnClose
        maskClosable={false}
        open={isChractorModalVisible}
        okText='确定'
        cancelText='取消'
        closable={false}
        onCancel={() => {
          setIsCharactorModalVisible(false);
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values: { name: string }) => {
              const newCharactor = { id: Date.now(), name: values.name };
              setCharactors([...charactors, newCharactor]);
              setIsCharactorModalVisible(false);
            })
            .catch(() => {
              // do nothing;
            });
        }}
      >
        <Form form={form}>
          <Form.Item
            name='name'
            label='名字'
            rules={[
              { required: true, pattern: /^\S+$/, message: '必须填写名字' },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
