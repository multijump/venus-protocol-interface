import BigNumber from 'bignumber.js';
import React from 'react';

import { userAssets } from '__mocks__/models/userAssets';
import { useGetUserAssets } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import MarketTable from '.';

jest.mock('clients/api');

describe('pages/Markets/MarketTable', () => {
  beforeEach(() => {
    (useGetUserAssets as jest.Mock).mockImplementation(() => ({
      data: {
        assets: userAssets,
        userTotalBorrowLimitCents: new BigNumber('111'),
        userTotalBorrowBalanceCents: new BigNumber('91'),
        userTotalSupplyBalanceCents: new BigNumber('910'),
      },
      isLoading: false,
    }));
  });

  it('renders without crashing', async () => {
    renderComponent(<MarketTable />);
  });
});
