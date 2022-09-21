import { waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { createMemoryHistory } from 'history';
import React from 'react';

import { marketSnapshots } from '__mocks__/models/marketSnapshots';
import { markets } from '__mocks__/models/markets';
import { vTokenApySimulations } from '__mocks__/models/vTokenApySimulations';
import { getMarketHistory, getMarkets, getVTokenApySimulations } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import UserMarket from '.';
import TEST_IDS from './testIds';

const fakeVTokenId = 'aave';
const fakeMarketId = 'fake-market-id';

jest.mock('clients/api');

describe('pages/UserMarket', () => {
  beforeEach(() => {
    (getMarketHistory as jest.Mock).mockImplementation(() => ({
      marketSnapshots,
    }));
    (getMarkets as jest.Mock).mockImplementation(() => ({
      markets,
      dailyXvsDistributedWei: new BigNumber(0),
    }));
    (getVTokenApySimulations as jest.Mock).mockImplementation(() => ({
      apySimulations: vTokenApySimulations,
    }));
  });

  it('renders without crashing', () => {
    const fakeHistory = createMemoryHistory();
    renderComponent(
      <UserMarket
        history={fakeHistory}
        location="/"
        match={{
          params: {
            vTokenId: fakeVTokenId,
            marketId: fakeMarketId,
          },
          isExact: true,
          path: '/:vTokenId',
          url: '',
        }}
      />,
    );
  });

  it('fetches market details and displays them correctly', async () => {
    const fakeHistory = createMemoryHistory();
    const { getByTestId } = renderComponent(
      <UserMarket
        history={fakeHistory}
        location="/"
        match={{
          params: {
            vTokenId: fakeVTokenId,
            marketId: fakeMarketId,
          },
          isExact: true,
          path: '/:vTokenId',
          url: '',
        }}
      />,
    );

    // Check supply info displays correctly
    await waitFor(() => expect(getByTestId(TEST_IDS.supplyInfo).textContent).toMatchSnapshot());
    // Check borrow info displays correctly
    expect(getByTestId(TEST_IDS.borrowInfo).textContent).toMatchSnapshot();
    // Check interest rate model displays correctly
    expect(getByTestId(TEST_IDS.interestRateModel).textContent).toMatchSnapshot();
    // Check market info displays correctly
    expect(getByTestId(TEST_IDS.marketInfo).textContent).toMatchSnapshot();
  });
});
