import { ComponentMeta, Story } from '@storybook/react';
import { BigNumber } from 'bignumber.js';
import noop from 'noop-ts';
import React from 'react';
import { VTokenId } from 'types';
import { getVBepToken } from 'utilities';

import fakeAddress from '__mocks__/models/address';
import { userAssets } from '__mocks__/models/userAssets';
import { withAuthContext, withCenterStory, withEnabledToken } from 'stories/decorators';

import { SupplyWithdrawProps, SupplyWithdrawUi, SupplyWithdrawUiProps } from '.';

export default {
  title: 'Pages/Dashboard/Modals/SupplyWithdraw',
  component: SupplyWithdrawUi,
  decorators: [withCenterStory({ width: 600 })],
  parameters: {
    backgrounds: {
      default: 'Primary',
    },
  },
} as ComponentMeta<typeof SupplyWithdrawUi>;

const Template: Story<SupplyWithdrawUiProps & SupplyWithdrawProps> = args => (
  <SupplyWithdrawUi {...args} />
);

const context = {
  login: noop,
  logOut: noop,
  openAuthModal: noop,
  closeAuthModal: noop,
  account: {
    address: fakeAddress,
  },
};

export const DisconnectedSupply = Template.bind({});
DisconnectedSupply.args = {
  asset: userAssets[0],
  assets: userAssets,
  onClose: noop,
  userTotalBorrowBalanceCents: new BigNumber('16'),
  userTotalBorrowLimitCents: new BigNumber('42.38'),
  isSupplyLoading: false,
  isWithdrawLoading: false,
};

export const DisabledSupply = Template.bind({});
DisabledSupply.decorators = [withAuthContext(context)];
DisabledSupply.args = {
  asset: userAssets[0],
  assets: userAssets,
  onClose: noop,
  userTotalBorrowBalanceCents: new BigNumber('16'),
  userTotalBorrowLimitCents: new BigNumber('42.38'),
  onSubmitSupply: noop,
  onSubmitWithdraw: noop,
  isSupplyLoading: false,
  isWithdrawLoading: false,
};

export const Supply = Template.bind({});
Supply.decorators = [
  withAuthContext(context),
  withEnabledToken({
    tokenId: userAssets[0].id,
    accountAddress: fakeAddress,
    spenderAddress: getVBepToken(userAssets[0].id as VTokenId).address,
  }),
];
Supply.args = {
  asset: userAssets[0],
  assets: userAssets,
  onClose: noop,
  userTotalBorrowBalanceCents: new BigNumber('16'),
  userTotalBorrowLimitCents: new BigNumber('42.38'),
  onSubmitSupply: noop,
  onSubmitWithdraw: noop,
  isSupplyLoading: false,
  isWithdrawLoading: false,
};
