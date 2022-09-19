import React from 'react';

import { assets } from '__mocks__/models/assets';
import { vTokenBalanceTreasury } from '__mocks__/models/vTokenBalanceTreasury';
import { getAssets, useGetVTokenBalancesAll } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import useGetTreasuryTotals, { UseGetTreasuryTotalsOutput } from '.';

jest.mock('clients/api');

describe('api/queries/useGetTreasuryTotals', () => {
  beforeEach(() => {
    (getAssets as jest.Mock).mockImplementation(() => ({ assets }));

    (useGetVTokenBalancesAll as jest.Mock).mockImplementation(() => ({
      data: {
        balances: vTokenBalanceTreasury,
      },
    }));
  });

  it('calculates totals correctly', async () => {
    let data: UseGetTreasuryTotalsOutput['data'];

    const CallMarketContext = () => {
      ({ data } = useGetTreasuryTotals());
      expect(data).toMatchSnapshot();
      return <div />;
    };

    renderComponent(<CallMarketContext />);
  });
});
