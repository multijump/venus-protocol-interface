import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TokenId } from 'types';
import { convertWeiToTokens } from 'utilities';

import vaiUnitrollerResponses from '__mocks__/contracts/vaiUnitroller';
import fakeAccountAddress from '__mocks__/models/address';
import fakeTransactionReceipt from '__mocks__/models/transactionReceipt';
import { getAllowance, getMintableVai, getVaiTreasuryPercentage, mintVai } from 'clients/api';
import formatToMintableVaiOutput from 'clients/api/queries/getMintableVai/formatToOutput';
import MAX_UINT256 from 'constants/maxUint256';
import { TOKENS } from 'constants/tokens';
import useSuccessfulTransactionModal from 'hooks/useSuccessfulTransactionModal';
import renderComponent from 'testUtils/renderComponent';
import en from 'translation/translations/en.json';

import RepayVai from '.';

jest.mock('clients/api');
jest.mock('components/Toast');
jest.mock('hooks/useSuccessfulTransactionModal');

const fakeGetMintableVaiOutput = formatToMintableVaiOutput(vaiUnitrollerResponses.getMintableVAI);

const fakeVaiTreasuryPercentage = 7.19;

describe('pages/Dashboard/vai/MintVai', () => {
  beforeEach(() => {
    // Mark token as enabled
    (getAllowance as jest.Mock).mockImplementation(() => ({
      allowanceWei: MAX_UINT256,
    }));

    (getMintableVai as jest.Mock).mockImplementation(() => fakeGetMintableVaiOutput);
  });

  it('renders without crashing', () => {
    renderComponent(() => <RepayVai />, {
      authContextValue: {
        account: {
          address: fakeAccountAddress,
        },
      },
    });
  });

  it('displays the correct available VAI limit and mint fee', async () => {
    (getVaiTreasuryPercentage as jest.Mock).mockImplementationOnce(async () => ({
      percentage: fakeVaiTreasuryPercentage,
    }));

    const { getByText } = renderComponent(() => <RepayVai />, {
      authContextValue: {
        account: {
          address: fakeAccountAddress,
        },
      },
    });

    // Check available VAI limit displays correctly
    const readableFakeMintableVai = convertWeiToTokens({
      valueWei: fakeGetMintableVaiOutput.mintableVaiWei,
      tokenId: TOKENS.vai.id as TokenId,
      returnInReadableFormat: true,
    });

    await waitFor(() => getByText(readableFakeMintableVai));
    // Check mint fee displays correctly
    await waitFor(() => getByText(`0 VAI (${fakeVaiTreasuryPercentage.toString()}%)`));
  });

  it('lets user mint VAI', async () => {
    const { openSuccessfulTransactionModal } = useSuccessfulTransactionModal();
    (mintVai as jest.Mock).mockImplementationOnce(async () => fakeTransactionReceipt);

    const { getByText, getByPlaceholderText } = renderComponent(() => <RepayVai />, {
      authContextValue: {
        account: {
          address: fakeAccountAddress,
        },
      },
    });
    await waitFor(() => getByText(en.vai.mintVai.submitButtonDisabledLabel));

    // Click on "SAFE MAX" button
    const safeMaxButton = getByText(en.vai.mintVai.rightMaxButtonLabel).closest(
      'button',
    ) as HTMLButtonElement;
    fireEvent.click(safeMaxButton);

    // Check input value updated to max amount of mintable VAI
    const fakeMintableVai = convertWeiToTokens({
      valueWei: fakeGetMintableVaiOutput.mintableVaiWei,
      tokenId: TOKENS.vai.id as TokenId,
    });

    const tokenTextFieldInput = getByPlaceholderText('0.00') as HTMLInputElement;
    await waitFor(() => expect(tokenTextFieldInput.value).toBe(fakeMintableVai.toFixed()));

    // Submit repayment request
    await waitFor(() => expect(getByText(en.vai.mintVai.submitButtonLabel)));

    const submitButton = getByText(en.vai.mintVai.submitButtonLabel).closest(
      'button',
    ) as HTMLButtonElement;
    fireEvent.click(submitButton);

    // Check mintVai was called correctly
    await waitFor(() => expect(mintVai).toHaveBeenCalledTimes(1));
    expect(mintVai).toHaveBeenCalledWith({
      fromAccountAddress: fakeAccountAddress,
      amountWei: fakeGetMintableVaiOutput.mintableVaiWei,
    });

    // Check successful transaction modal is displayed
    await waitFor(() => expect(openSuccessfulTransactionModal).toHaveBeenCalledTimes(1));
    expect(openSuccessfulTransactionModal).toHaveBeenCalledWith({
      transactionHash: fakeTransactionReceipt.transactionHash,
      amount: {
        tokenId: TOKENS.vai.id as TokenId,
        valueWei: fakeGetMintableVaiOutput.mintableVaiWei,
      },
      content: expect.any(String),
      title: expect.any(String),
    });
  });

  // TODO: add tests to cover failing scenarios (see VEN-631)
});
