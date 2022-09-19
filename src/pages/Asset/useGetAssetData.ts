import BigNumber from 'bignumber.js';
import React from 'react';
import { TokenId, VBepToken } from 'types';
import { convertPercentageFromSmartContract, convertWeiToTokens, getToken } from 'utilities';

import { useGetAssets, useGetVTokenCash } from 'clients/api';
import { BLOCKS_PER_DAY } from 'constants/bsc';
import { COMPOUND_MANTISSA } from 'constants/compoundMantissa';
import { TOKENS, VTOKEN_DECIMALS } from 'constants/tokens';

const useGetAssetData = ({ vTokenId }: { vTokenId: VBepToken['id'] }) => {
  const { data: vTokenCashData } = useGetVTokenCash({
    vTokenId,
  });

  const { data: getAssetsData } = useGetAssets();
  const asset = (getAssetsData?.assets || []).find(item => item.id === vTokenId);

  return React.useMemo(() => {
    // const mintedTokens = asset && new BigNumber(asset.totalSupply2);
    const reserveFactorMantissa = asset && new BigNumber(asset.reserveFactor);

    const dailyDistributionXvs =
      asset &&
      convertWeiToTokens({
        valueWei: new BigNumber(asset.supplyDailyXvsWei).plus(asset.borrowDailyXvsWei),
        tokenId: TOKENS.xvs.id as TokenId,
      });

    const formattedSupplyRatePerBlock =
      asset && new BigNumber(asset.supplyRatePerBlock).dividedBy(COMPOUND_MANTISSA).toNumber();

    const formattedBorrowRatePerBlock =
      asset && new BigNumber(asset.borrowRatePerBlock).dividedBy(COMPOUND_MANTISSA).toNumber();

    // Calculate daily interests for suppliers and borrowers. Note that we don't
    // use BigNumber to calculate these values, as this would slow down
    // calculation a lot while the end result doesn't need to be extremely
    // precise
    const dailySupplyingInterestsCents =
      asset &&
      formattedSupplyRatePerBlock &&
      // prettier-ignore
      (+asset.totalSupplyCents / 100) * (((1 + formattedSupplyRatePerBlock) ** BLOCKS_PER_DAY) - 1) *
      // Convert to cents
      100;

    const dailyBorrowingInterestsCents =
      asset &&
      formattedBorrowRatePerBlock &&
      // prettier-ignore
      (+asset.totalBorrowsCents / 100) * (((1 + formattedBorrowRatePerBlock) ** BLOCKS_PER_DAY) - 1)
        // Convert to cents
        * 100;

    const reserveFactor = asset && convertPercentageFromSmartContract(asset.reserveFactor);

    const collateralFactor = asset && convertPercentageFromSmartContract(asset.collateralFactor);

    const reserveTokens =
      asset &&
      convertWeiToTokens({
        valueWei: new BigNumber(asset.totalReservesWei),
        tokenId: vTokenId,
      });

    const exchangeRateVTokens =
      asset &&
      new BigNumber(1).div(
        new BigNumber(asset.exchangeRate).div(
          new BigNumber(10).pow(18 + getToken(vTokenId).decimals - VTOKEN_DECIMALS),
        ),
      );

    let currentUtilizationRate: number | undefined;
    if (vTokenCashData?.cashWei && asset && reserveTokens) {
      const vTokenCashTokens = convertWeiToTokens({
        valueWei: vTokenCashData.cashWei,
        tokenId: vTokenId,
      });

      currentUtilizationRate = new BigNumber(asset.totalBorrowsTokens)
        .div(vTokenCashTokens.plus(asset.totalBorrowsTokens).minus(reserveTokens))
        .multipliedBy(100)
        .dp(0)
        .toNumber();
    }

    return {
      ...asset,
      mintedTokens: asset?.totalSupplyTokens,
      borrowCapTokens: asset?.borrowCapTokens,
      dailyDistributionXvs,
      dailySupplyingInterestsCents,
      dailyBorrowingInterestsCents,
      reserveFactor,
      collateralFactor,
      reserveTokens,
      exchangeRateVTokens,
      currentUtilizationRate,
      reserveFactorMantissa,
    };
  }, [JSON.stringify(asset), vTokenCashData?.cashWei.toFixed()]);
};

export default useGetAssetData;
