import React from 'react';
import { Tabs } from 'antd';
import { Floor23 } from './floors/floor23';
import { Floor24 } from './floors/floor24';
import { Floor39 } from './floors/floor39';

import './index.less';

export const OZ = () => {
  return (
    <div className='oz'>
      <Tabs
        defaultActiveKey='23'
        items={[
          {
            label: '23',
            key: '23',
            children: <Floor23 />,
          },
          {
            label: '24',
            key: '24',
            children: <Floor24 />,
          },
          {
            label: '39',
            key: '39',
            children: <Floor39 />,
          },
        ]}
      />
    </div>
  );
};
