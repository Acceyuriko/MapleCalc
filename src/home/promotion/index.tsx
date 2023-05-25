import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Typography, Collapse, Form, Button, InputNumber } from 'antd';
import type { Charactor, BaseInfo } from '../index';

import './index.less';

export interface Props {
  promotion: Charactor['promotion'];
  onPromotionChange: (promotion: Charactor['promotion']) => void;
}

const { Paragraph, Text, Title } = Typography;

export const Promotion = ({ promotion, onPromotionChange }: Props) => {
  const [form] = Form.useForm();

  const details = useRef({
    att: 0,
    attPer: 0,
    stat: 0,
    statPer: 0,
    crit: 0,
    boss: 0,
    ied300: 0,
    ied380: 0,
  });
  const [equation, setEuqation] = useState<React.ReactNode>();

  const compute = useCallback(() => {
    form
      .validateFields()
      .then((values: BaseInfo) => {
        onPromotionChange({
          ...promotion!,
          base: values,
        });
      })
      .catch(() => {
        // do nothing
      });
  }, [form, onPromotionChange, promotion]);

  useEffect(() => {
    if (!promotion) {
      return;
    }
    if (promotion.base) {
      const { range, zero, stat, statPer, att, attPer, crit, boss, ied } =
        promotion.base;
      details.current.stat = (stat.promotion - zero) / stat.amount / range;
      if (statPer.amount !== 0) {
        details.current.statPer =
          (statPer.promotion - zero) / statPer.amount / range;
      }
      details.current.att = (att.promotion - zero) / att.amount / range;
      details.current.attPer = (range - attPer) / range;
      const currentCrit = crit / 100 + 1.35;
      details.current.crit = (currentCrit + 0.01) / currentCrit - 1;
      const currentBoss = boss / 100 + 1;
      details.current.boss = (currentBoss + 0.01) / currentBoss - 1;
      const currentDef300 = 300 * (1 - ied / 100) * 0.8; // 核心提供 20% 无视
      details.current.ied300 =
        (100 - currentDef300 * 0.99) / (100 - currentDef300) - 1;
      const currentDef380 = 380 * (1 - ied / 100) * 0.8;
      details.current.ied380 =
        (100 - currentDef380 * 0.99) / (100 - currentDef380) - 1;

      console.log('computed details, ', details.current);
      setEuqation(
        <ul>
          {[
            { text: 'att%', property: 'attPer' },
            { text: 'crit', property: 'crit' },
            { text: 'boss', property: 'boss' },
            { text: 'ied 380', property: 'ied380' },
            { text: 'ied 300', property: 'ied300' },
            { text: 'all%', property: 'statPer' },
            { text: 'att', property: 'att' },
          ].map((i) => (
            <li key={i.text}>
              1 {i.text} ={' '}
              {(
                details.current[i.property as keyof typeof details.current] /
                details.current.stat
              ).toFixed(2)}{' '}
              stat
            </li>
          ))}
        </ul>,
      );
    }
  }, [promotion]);

  return (
    <div className='promotion'>
      <Collapse>
        <Collapse.Panel key='preparation' header='准备工作'>
          <div className='preparation-wrapper'>
            <div style={{ flexGrow: 1 }}>
              <Paragraph>
                <ul>
                  <li>基础面板数值可以直接填入。</li>
                  <li>
                    借助圣杯（Pink Holy Cup）来计算 all% / att / stat 的收益。
                    <Text delete>
                      当然用别的装备火花也可以，只是圣杯比较好找。
                    </Text>
                    需要准备四个圣杯, 其火花需要满足如下条件
                    <ul>
                      <li>第一个什么都不加作为基准</li>
                      <li>第二个只加 all% （白毛不需要这个，可填0）</li>
                      <li>第三个只加 att （法师当然是 matt）</li>
                      <li>第四个只加 stat</li>
                    </ul>
                  </li>
                  <li>拆装怪怪 att% 的 badge 可以计算 att% 的收益。</li>
                </ul>
              </Paragraph>
              <Form
                form={form}
                initialValues={promotion?.base}
                labelCol={{ span: 8 }}
                labelAlign='left'
              >
                <Form.Item
                  name='range'
                  label='面板上限'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name='ied'
                  label='无视防御'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber addonAfter='%' />
                </Form.Item>
                <Form.Item
                  name='boss'
                  label='boss伤'
                  extra='damage + boss damage'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber addonAfter='%' />
                </Form.Item>
                <Form.Item
                  name='crit'
                  label='暴伤'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber addonAfter='%' />
                </Form.Item>
                <Form.Item
                  name='zero'
                  label='基准圣杯面板提升'
                  required
                  rules={[{ required: true }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name={['statPer', 'amount']}
                  label='圣杯all%增量'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber addonAfter='%' />
                </Form.Item>
                <Form.Item
                  name={['statPer', 'promotion']}
                  label='圣杯all%面板加成'
                  rules={[{ required: true }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name={['stat', 'amount']}
                  label='圣杯stat增量'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name={['stat', 'promotion']}
                  label='圣杯stat面板加成'
                  rules={[{ required: true }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name={['att', 'amount']}
                  label='圣杯att增量'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name={['att', 'promotion']}
                  label='圣杯att面板加成'
                  rules={[{ required: true }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name='attPer'
                  label='不装 1% att 怪怪 badge 的面板'
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                  <Button onClick={compute} type='primary'>
                    计算
                  </Button>
                </Form.Item>
              </Form>
            </div>
            {equation && (
              <Title className='equations' level={2}>
                {equation}
              </Title>
            )}
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
