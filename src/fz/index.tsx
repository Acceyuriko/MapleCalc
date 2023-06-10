import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Space,
  Table,
  Form,
  Input,
  Select,
  message,
} from 'antd';
import fuzzy from 'fuzzy';

import './index.less';

export interface FzUser {
  id: number;
  channel: number;
  map: string;
  name?: string;
  duration: number;
  start: number;
}

const KEY_FZ_USERS = 'fz_users';
const KEY_FZ_MAPS = 'fz_maps';

export const FZ = () => {
  const [form] = Form.useForm();

  const [data, reactSetData] = useState<FzUser[]>(
    localStorage.getItem(KEY_FZ_USERS)
      ? JSON.parse(localStorage.getItem(KEY_FZ_USERS)!)
      : [],
  );

  const setData = useCallback((data: FzUser[]) => {
    reactSetData(data);
    localStorage.setItem(KEY_FZ_USERS, JSON.stringify(data));
  }, []);

  const [maps, reactSetMaps] = useState<string[]>(
    localStorage.getItem(KEY_FZ_MAPS)
      ? JSON.parse(localStorage.getItem(KEY_FZ_MAPS)!)
      : [],
  );

  const setMaps = useCallback((maps: string[]) => {
    reactSetMaps(maps);
    localStorage.setItem(KEY_FZ_MAPS, JSON.stringify(maps));
  }, []);

  const [selected, setSelected] = useState<FzUser>();
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [, setUpdate] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdate((pre) => pre + 1);
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [data, setData]);

  return (
    <div className='fz'>
      <div className='operation-header'>
        <Button
          onClick={() => {
            setIsUserModalVisible(true);
          }}
        >
          添加
        </Button>
      </div>
      <Table
        dataSource={data}
        rowKey={(row) => row.id}
        pagination={false}
        rowClassName={(_, index) => {
          let gray = false;
          for (let i = 1; i <= index; i++) {
            if (data[i].channel !== data[i - 1].channel) {
              gray = !gray;
            }
          }
          return gray ? 'gray' : '';
        }}
        columns={[
          {
            title: 'name',
            render: (row: FzUser) => (
              <Space>
                {row.name}
                <Button
                  size='small'
                  onClick={() => {
                    navigator.clipboard.writeText(row.name!);
                    message.success('copied');
                  }}
                >
                  copy
                </Button>
              </Space>
            ),
          },
          {
            title: 'channel',
            render: (row: FzUser) => row.channel,
          },
          {
            title: 'map',
            render: (row: FzUser) => (
              <Space>
                {row.map}
                <Button
                  size='small'
                  onClick={() => {
                    navigator.clipboard.writeText(row.map!);
                    message.success('copied');
                  }}
                >
                  copy
                </Button>
              </Space>
            ),
          },
          {
            title: 'duration',
            render: (row: FzUser) => row.duration + ` h`,
          },
          {
            title: 'remain',
            render: (row: FzUser) => {
              let remain = row.start + row.duration * 60 * 60 * 1000;
              if (remain < Date.now()) {
                return 'finished';
              }
              remain = remain - Date.now();
              const hours = remain / (60 * 60 * 1000);
              const minutes = (remain % (60 * 60 * 1000)) / (60 * 1000);
              return `${Math.floor(hours)}:${Math.floor(minutes)}`;
            },
          },
          {
            title: 'operation',
            render: (row: FzUser) => {
              return (
                <Space>
                  <Button
                    onClick={() => {
                      setSelected(row);
                      setIsUserModalVisible(true);
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    type='primary'
                    onClick={() => {
                      Modal.confirm({
                        title: '确认完成吗?',
                        content: '完成之后用户将从列表中消失',
                        onOk: (close) => {
                          const newData = [...data];
                          const index = newData.findIndex(
                            (item) => item.id === row.id,
                          );
                          newData.splice(index, 1);
                          setData(newData);
                          close();
                        },
                      });
                    }}
                  >
                    Complete
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />
      {isUserModalVisible && (
        <Modal
          title={selected ? '修改用户' : '添加用户'}
          open
          maskClosable={false}
          onCancel={() => {
            setIsUserModalVisible(false);
          }}
          onOk={() => {
            form
              .validateFields()
              .then(
                (values: {
                  name?: string;
                  channel: number;
                  map: string;
                  duration: number;
                }) => {
                  const newData = [...data];
                  if (selected) {
                    const index = newData.findIndex(
                      (item) => item.id === selected.id,
                    );
                    newData[index] = {
                      ...selected,
                      ...values,
                    };
                  } else {
                    newData.push({
                      id: Date.now(),
                      start: Date.now(),
                      ...values,
                    });
                  }
                  newData.sort((a, b) => {
                    if (a.channel !== b.channel) {
                      return a.channel - b.channel;
                    }
                    return (
                      a.start +
                      a.duration * 60 * 60 * 1000 -
                      (b.start + b.duration * 60 * 60 * 1000)
                    );
                  });
                  setData(newData);
                  setSelected(undefined);
                  setIsUserModalVisible(false);
                },
              )
              .catch((e) => {
                console.warn('validation failed, ', e);
                // do nothing
              });
          }}
        >
          <Form form={form} initialValues={selected} labelCol={{ span: 6 }}>
            <Form.Item label='name' name='name'>
              <Input />
            </Form.Item>
            <Form.Item
              label='channel'
              name='channel'
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                options={new Array(20).fill(null).map((_, index) => {
                  return {
                    label: index + 1,
                    value: index + 1,
                  };
                })}
              />
            </Form.Item>
            <Form.Item
              label='map'
              name='map'
              rules={[{ required: true }]}
              extra={
                <Button
                  onClick={() => {
                    setIsMapModalVisible(true);
                  }}
                >
                  manage maps
                </Button>
              }
            >
              <Select
                showSearch
                options={maps.map((i) => ({ label: i, value: i }))}
                filterOption={(input: string, option) => {
                  return fuzzy.test(input, option!.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label='duration'
              name='duration'
              rules={[{ required: true }]}
            >
              <Select
                options={new Array(20).fill(null).map((_, index) => {
                  return {
                    label: (index + 1) / 2,
                    value: (index + 1) / 2,
                  };
                })}
                showSearch
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
      {isMapModalVisible && (
        <Modal
          title='manage maps'
          open
          onOk={() => {
            setIsMapModalVisible(false);
          }}
          maskClosable={false}
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          <Select
            style={{ width: '100%' }}
            mode='tags'
            options={maps.map((i) => ({ label: i, value: i }))}
            value={maps}
            onChange={(next) => {
              setMaps(next);
            }}
          />
        </Modal>
      )}
    </div>
  );
};
