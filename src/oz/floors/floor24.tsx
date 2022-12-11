import React from 'react';
import { Table } from 'antd';

const data = [
  {
    town: 'Aquarium',
    description:
      'Wow, the exciting life of playing and swimming with the fish in the ocean.',
  },
  {
    town: 'Ariant',
    description:
      'It feels like a cobra will come out of a jar under the scorching sunlight of the desert.',
  },
  {
    town: 'Edelstein',
    description:
      'It seems like the mechanics are hard at work making something!',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
  {
    town: '',
    description: '',
  },
];

export const Floor24 = () => {
  return (
    <div>
      <Table dataSource={data} />
    </div>
  );
};
