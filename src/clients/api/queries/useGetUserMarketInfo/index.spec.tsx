import { waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import fakeAddress from '__mocks__/models/address';
import { assetsInAccount } from '__mocks__/models/assetsInAccount';
import { markets } from '__mocks__/models/markets';
import { vTokenBalanceTreasury } from '__mocks__/models/vTokenBalanceTreasury';
import { vTokenBalancesAccount } from '__mocks__/models/vTokenBalancesAccount';
import { getAssetsInAccount, getMarkets, getMintedVai, useGetVTokenBalancesAll } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import useGetUserMarketInfo, { UseGetUserMarketsOutput } from '.';

jest.mock('clients/api');

const fakeUserVaiMintedWei = new BigNumber('10000000000000000');

describe('api/queries/useGetUserMarketInfo', () => {
  beforeEach(() => {
    (getMarkets as jest.Mock).mockImplementation(() => ({ markets }));
    (getAssetsInAccount as jest.Mock).mockImplementation(() => ({
      tokenAddresses: assetsInAccount,
    }));
    (getMintedVai as jest.Mock).mockImplementation(() => ({
      mintedVaiWei: fakeUserVaiMintedWei,
    }));

    (useGetVTokenBalancesAll as jest.Mock).mockImplementation(({ account }) => {
      if (account === fakeAddress) {
        return { data: { balances: vTokenBalancesAccount } };
      }
      return { data: { balances: vTokenBalanceTreasury } };
    });
  });

  it('calculates totals and formats user markets correctly', async () => {
    let data: UseGetUserMarketsOutput['data'] = {
      userMarkets: [],
      userTotalBorrowBalanceCents: 0,
      userTotalBorrowLimitCents: 0,
      userTotalSupplyBalanceCents: 0,
      totalXvsDistributedWei: new BigNumber(0),
      dailyXvsDistributedWei: new BigNumber(0),
    };

    const CallMarketContext = () => {
      ({ data } = useGetUserMarketInfo({ accountAddress: fakeAddress }));
      return <div />;
    };

    renderComponent(<CallMarketContext />, {
      authContextValue: { account: { address: fakeAddress } },
    });

    await waitFor(() => expect(data.userMarkets.length > 0).toBe(true));
    expect(data).toMatchSnapshot();
  });
});
