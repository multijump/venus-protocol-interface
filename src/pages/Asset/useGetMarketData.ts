import BigNumber from 'bignumber.js';
import React from 'react';
import { TokenId, VBepToken } from 'types';
import { convertPercentageFromSmartContract, convertWeiToTokens, getToken } from 'utilities';

import { useGetMarkets, useGetVTokenCash } from 'clients/api';
import { BLOCKS_PER_DAY } from 'constants/bsc';
import { COMPOUND_MANTISSA } from 'constants/compoundMantissa';
import { TOKENS, VTOKEN_DECIMALS } from 'constants/tokens';

const useGetMarketData = ({ vTokenId }: { vTokenId: VBepToken['id'] }) => {
  const { data: vTokenCashData } = useGetVTokenCash({
    vTokenId,
  });

  const { data: getMarketData } = useGetMarkets();
  const assetMarket = (getMarketData?.markets || []).find(market => market.id === vTokenId);

  return React.useMemo(() => {
    const mintedTokens = assetMarket && new BigNumber(assetMarket.totalSupplyTokens);
    const reserveFactorMantissa = assetMarket && new BigNumber(assetMarket.reserveFactor);

    const dailyDistributionXvs =
      assetMarket &&
      convertWeiToTokens({
        valueWei: new BigNumber(assetMarket.supplyDailyXvsWei).plus(assetMarket.borrowDailyXvsWei),
        tokenId: TOKENS.xvs.id as TokenId,
      });

    const formattedSupplyRatePerBlock =
      assetMarket &&
      new BigNumber(assetMarket.supplyRatePerBlock).dividedBy(COMPOUND_MANTISSA).toNumber();

    const formattedBorrowRatePerBlock =
      assetMarket &&
      new BigNumber(assetMarket.borrowRatePerBlock).dividedBy(COMPOUND_MANTISSA).toNumber();

    // Calculate daily interests for suppliers and borrowers. Note that we don't
    // use BigNumber to calculate these values, as this would slow down
    // calculation a lot while the end result doesn't need to be extremely
    // precise
    const dailySupplyingInterestsCents =
      assetMarket &&
      formattedSupplyRatePerBlock &&
      // prettier-ignore
      (assetMarket.totalBorrowsCents / 100) * (((1 + formattedSupplyRatePerBlock) ** BLOCKS_PER_DAY) - 1) *
      // Convert to cents
      100;

    const dailyBorrowingInterestsCents =
      assetMarket &&
      formattedBorrowRatePerBlock &&
      // prettier-ignore
      (assetMarket.totalBorrowsCents / 100) * (((1 + formattedBorrowRatePerBlock) ** BLOCKS_PER_DAY) - 1)
        // Convert to cents
        * 100;

    const reserveFactor =
      assetMarket && convertPercentageFromSmartContract(assetMarket.reserveFactor);

    const collateralFactor =
      assetMarket && convertPercentageFromSmartContract(assetMarket.collateralFactor);

    const reserveTokens =
      assetMarket &&
      convertWeiToTokens({
        valueWei: new BigNumber(assetMarket.totalReservesWei),
        tokenId: vTokenId,
      });

    const exchangeRateVTokens =
      assetMarket &&
      new BigNumber(1).div(
        new BigNumber(assetMarket.exchangeRate).div(
          new BigNumber(10).pow(18 + getToken(vTokenId).decimals - VTOKEN_DECIMALS),
        ),
      );

    let currentUtilizationRate: number | undefined;
    if (vTokenCashData?.cashWei && assetMarket && reserveTokens) {
      const vTokenCashTokens = convertWeiToTokens({
        valueWei: vTokenCashData.cashWei,
        tokenId: vTokenId,
      });

      currentUtilizationRate = new BigNumber(assetMarket.totalBorrowsTokens)
        .div(vTokenCashTokens.plus(assetMarket.totalBorrowsTokens).minus(reserveTokens))
        .multipliedBy(100)
        .dp(0)
        .toNumber();
    }

    return {
      totalBorrowBalanceCents: assetMarket?.totalBorrowsCents,
      totalSupplyBalanceCents: assetMarket?.totalSupplyCents,
      borrowApyPercentage: assetMarket?.borrowApy,
      supplyApyPercentage: assetMarket?.supplyApy,
      borrowDistributionApyPercentage: assetMarket?.borrowXvsApy,
      supplyDistributionApyPercentage: assetMarket?.supplyXvsApy,
      tokenPriceDollars: assetMarket?.tokenPriceDollars,
      liquidityCents: assetMarket?.liquidityCents,
      supplierCount: assetMarket?.supplierCount,
      borrowerCount: assetMarket?.borrowerCount,
      borrowCapTokens: assetMarket?.borrowCapTokens,
      mintedTokens,
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
  }, [JSON.stringify(assetMarket), vTokenCashData?.cashWei.toFixed()]);
};

export default useGetMarketData;
