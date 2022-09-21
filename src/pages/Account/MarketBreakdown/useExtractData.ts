import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { UserMarket } from 'types';
import {
  calculateCollateralValue,
  calculateDailyEarningsCents,
  calculateNetApy,
  calculateYearlyEarningsForAssets,
  convertTokensToWei,
  formatCentsToReadableValue,
  formatToReadablePercentage,
} from 'utilities';

import { SAFE_BORROW_LIMIT_PERCENTAGE } from 'constants/safeBorrowLimitPercentage';

const useExtractData = ({ markets, includeXvs }: { markets: UserMarket[]; includeXvs: boolean }) =>
  useMemo(() => {
    const { totalBorrowCents, totalSupplyCents, borrowLimitCents } = markets.reduce(
      (acc, asset) => ({
        totalBorrowCents: acc.totalBorrowCents.plus(
          asset.borrowBalanceTokens.times(asset.tokenPriceDollars).times(100),
        ),
        totalSupplyCents: acc.totalSupplyCents.plus(
          asset.supplyBalanceTokens.times(asset.tokenPriceDollars).times(100),
        ),
        borrowLimitCents: asset.collateral
          ? acc.borrowLimitCents.plus(
              calculateCollateralValue({
                amountWei: convertTokensToWei({
                  value: asset.supplyBalanceTokens,
                  tokenId: asset.id,
                }),
                tokenId: asset.id,
                tokenPriceDollars: asset.tokenPriceDollars,
                collateralFactor: asset.collateralFactor,
              }).times(100),
            )
          : acc.borrowLimitCents,
      }),
      {
        totalSupplyCents: new BigNumber(0),
        totalBorrowCents: new BigNumber(0),
        borrowLimitCents: new BigNumber(0),
      },
    );

    const yearlyEarningsCents = calculateYearlyEarningsForAssets({
      markets,
      includeXvs,
    });

    const dailyEarningsCentsTmp =
      yearlyEarningsCents && calculateDailyEarningsCents(yearlyEarningsCents).toNumber();

    const netApyPercentageTmp =
      yearlyEarningsCents &&
      calculateNetApy({
        supplyBalanceCents: totalSupplyCents,
        yearlyEarningsCents,
      });

    const safeBorrowLimitCentsTmp = borrowLimitCents.multipliedBy(
      SAFE_BORROW_LIMIT_PERCENTAGE / 100,
    );

    const readableSafeBorrowLimitTmp = formatCentsToReadableValue({
      value: safeBorrowLimitCentsTmp,
    });

    const safeBorrowLimitPercentageTmp = formatToReadablePercentage(
      safeBorrowLimitCentsTmp.multipliedBy(100).dividedBy(borrowLimitCents),
    );

    return {
      dailyEarningsCents: dailyEarningsCentsTmp,
      netApyPercentage: netApyPercentageTmp,
      readableSafeBorrowLimit: readableSafeBorrowLimitTmp,
      safeBorrowLimitPercentage: safeBorrowLimitPercentageTmp,
      totalBorrowCents,
      totalSupplyCents,
      borrowLimitCents,
    };
  }, [JSON.stringify(markets), includeXvs]);

export default useExtractData;
