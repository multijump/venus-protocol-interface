import BigNumber from 'bignumber.js';
import React from 'react';

import { assets } from '__mocks__/models/assets';
import { vTokenBalanceTreasury } from '__mocks__/models/vTokenBalanceTreasury';
import { getAssets, useGetTreasuryTotals, useGetVTokenBalancesAll } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import Markets from '.';

jest.mock('clients/api');

describe('pages/Markets', () => {
  beforeEach(() => {
    (getAssets as jest.Mock).mockImplementation(() => ({ assets }));
    (useGetVTokenBalancesAll as jest.Mock).mockImplementation(() => ({
      data: { balances: vTokenBalanceTreasury },
    }));
    (useGetTreasuryTotals as jest.Mock).mockImplementation(() => ({
      data: {
        treasuryTotalSupplyBalanceCents: new BigNumber(0),
        treasuryTotalBorrowBalanceCents: new BigNumber(0),
        treasuryTotalBalanceCents: new BigNumber(0),
        treasuryTotalAvailableLiquidityBalanceCents: new BigNumber(0),
      },
      isLoading: false,
    }));
  });

  it('renders without crashing', async () => {
    renderComponent(<Markets />);
  });
});
