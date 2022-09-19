import { waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import fakeAddress from '__mocks__/models/address';
import { assets } from '__mocks__/models/assets';
import { assetsInAccount } from '__mocks__/models/assetsInAccount';
import { vTokenBalanceTreasury } from '__mocks__/models/vTokenBalanceTreasury';
import { vTokenBalancesAccount } from '__mocks__/models/vTokenBalancesAccount';
import { getAssets, getAssetsInAccount, getMintedVai, useGetVTokenBalancesAll } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import useGetUserAssets, { UseGetUserAssetsOutput } from '.';

jest.mock('clients/api');

const fakeUserVaiMintedWei = new BigNumber('10000000000000000');

describe('api/queries/useGetUserAssets', () => {
  beforeEach(() => {
    (getAssets as jest.Mock).mockImplementation(() => ({
      assets,
      dailyXvsDistributedWei: new BigNumber('17289362561374812321'),
    }));
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

  it('calculates totals and formats user assets correctly', async () => {
    let data: UseGetUserAssetsOutput['data'] = {
      assets: [],
      userTotalBorrowBalanceCents: 0,
      userTotalBorrowLimitCents: 0,
      userTotalSupplyBalanceCents: 0,
      totalXvsDistributedWei: new BigNumber(0),
      dailyXvsDistributedWei: new BigNumber(0),
    };

    const CallMarketContext = () => {
      ({ data } = useGetUserAssets({ accountAddress: fakeAddress }));
      return <div />;
    };

    renderComponent(<CallMarketContext />, {
      authContextValue: { account: { address: fakeAddress } },
    });

    await waitFor(() => expect(data.assets.length > 0).toBe(true));
    expect(data).toMatchSnapshot();
  });
});
