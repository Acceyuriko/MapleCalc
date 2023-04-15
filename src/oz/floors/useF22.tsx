import React from 'react';
import { Space } from 'antd';
import F22_1 from '../../images/f22_1.webp';
import F22_2 from '../../images/f22_2.webp';

export const useF22 = ({ currentFloor }: { currentFloor: number }) => {
  if (currentFloor !== 22) {
    return null;
  }

  return {
    content: (
      <Space direction='vertical' style={{ display: 'flex' }}>
        <img src={F22_1} />
        <img src={F22_2} />
      </Space>
    ),
  };
};
