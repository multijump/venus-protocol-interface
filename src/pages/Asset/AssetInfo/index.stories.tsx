import { ComponentMeta } from '@storybook/react';
import React from 'react';

import { withCenterStory, withRouter } from 'stories/decorators';

import AssetInfo, { AssetInfoProps } from '.';

export default {
  title: 'Pages/MarketDetail/AssetInfo',
  component: AssetInfo,
  decorators: [withRouter, withCenterStory({ width: 400 })],
  parameters: {
    backgrounds: {
      default: 'Primary',
    },
  },
} as ComponentMeta<typeof AssetInfo>;

const stats: AssetInfoProps['stats'] = [
  {
    label: 'Fake stat 1',
    value: '100%',
  },
  {
    label: 'Fake stat 2',
    value: 1000000,
  },
];

export const Default = () => <AssetInfo stats={stats} />;
