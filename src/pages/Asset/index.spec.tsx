import { waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { createMemoryHistory } from 'history';
import React from 'react';

import { assetSnapshots } from '__mocks__/models/assetSnapshots';
import { markets } from '__mocks__/models/markets';
import { vTokenApySimulations } from '__mocks__/models/vTokenApySimulations';
import { getAssetHistory, getMarkets, getVTokenApySimulations } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import Asset from '.';
import TEST_IDS from './testIds';

const fakeVTokenId = 'aave';
const fakeMarketId = 'fake-market-id';

jest.mock('clients/api');

describe('pages/Asset', () => {
  beforeEach(() => {
    (getAssetHistory as jest.Mock).mockImplementation(() => ({
      assetSnapshots,
    }));
    (getMarkets as jest.Mock).mockImplementation(() => ({
      markets,
      dailyVenusWei: new BigNumber(0),
    }));
    (getVTokenApySimulations as jest.Mock).mockImplementation(() => ({
      apySimulations: vTokenApySimulations,
    }));
  });

  it('renders without crashing', () => {
    const fakeHistory = createMemoryHistory();
    renderComponent(
      <Asset
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
      <Asset
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
