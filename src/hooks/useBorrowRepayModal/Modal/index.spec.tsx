import { waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import React from 'react';
import { TokenId } from 'types';
import { DISABLED_TOKENS } from 'utilities';

import { userAssets } from '__mocks__/models/userAssets';
import { useGetUserAssets } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';
import en from 'translation/translations/en.json';

import BorrowRepay from '.';

const asset = userAssets[1];

jest.mock('clients/api');

describe('hooks/useBorrowRepayModal', () => {
  beforeEach(() => {
    (useGetUserAssets as jest.Mock).mockImplementation(() => ({
      data: {
        assets: userAssets,
        userTotalBorrowLimitCents: new BigNumber('111'),
        userTotalBorrowBalanceCents: new BigNumber('91'),
      },
      isLoading: false,
    }));
  });

  it('renders without crashing', async () => {
    const { getByText } = renderComponent(
      <BorrowRepay onClose={jest.fn()} assetId={asset.id} includeXvs />,
    );
    await waitFor(() => expect(getByText(en.borrowRepayModal.borrowTabTitle)));
  });

  it.each(DISABLED_TOKENS)('does not display borrow tab when asset is %s', async tokenId => {
    const { queryByText } = renderComponent(() => (
      <BorrowRepay onClose={jest.fn()} assetId={tokenId as TokenId} includeXvs />
    ));

    await waitFor(() => expect(queryByText(en.borrowRepayModal.borrowTabTitle)).toBeNull());
  });
});
