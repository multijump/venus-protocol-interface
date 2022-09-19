import BigNumber from 'bignumber.js';
import { UserAsset } from 'types';

export const calculateYearlyEarningsForAsset = ({
  asset,
  includeXvs,
}: {
  asset: UserAsset;
  includeXvs: boolean;
}) => {
  const assetBorrowBalanceCents = asset.borrowBalanceTokens
    .multipliedBy(asset.tokenPriceDollars)
    .multipliedBy(100);
  const assetSupplyBalanceCents = asset.supplyBalanceTokens
    .multipliedBy(asset.tokenPriceDollars)
    .multipliedBy(100);

  const supplyYearlyEarningsCents = assetSupplyBalanceCents.multipliedBy(asset.supplyApy / 100);
  // Note that borrowYearlyEarningsCents will always be negative (or 0), since
  // the borrow APY is expressed with a negative percentage)
  const borrowYearlyEarningsCents = assetBorrowBalanceCents.multipliedBy(asset.borrowApy / 100);

  const yearlyEarningsCents = supplyYearlyEarningsCents.plus(borrowYearlyEarningsCents);

  if (!includeXvs || !Number.isFinite(asset.xvsSupplyApr) || !Number.isFinite(asset.xvsBorrowApr)) {
    return yearlyEarningsCents;
  }

  // Add earnings from XVS distribution
  const supplyYearlyXvsDistributionEarningsCents = supplyYearlyEarningsCents.multipliedBy(
    asset.xvsSupplyApr / 100,
  );

  const borrowYearlyXvsDistributionEarningsCents = borrowYearlyEarningsCents.multipliedBy(
    asset.xvsBorrowApr / 100,
  );

  return yearlyEarningsCents
    .plus(supplyYearlyXvsDistributionEarningsCents)
    .plus(borrowYearlyXvsDistributionEarningsCents);
};

export const calculateYearlyEarningsForAssets = ({
  assets,
  includeXvs,
}: {
  assets: UserAsset[];
  includeXvs: boolean;
}) => {
  // We use the yearly earnings to calculate the daily earnings the net APY
  let yearlyEarningsCents: BigNumber | undefined;

  assets.forEach(asset => {
    if (!yearlyEarningsCents) {
      yearlyEarningsCents = new BigNumber(0);
    }

    const assetYearlyEarningsCents = calculateYearlyEarningsForAsset({
      asset,
      includeXvs,
    });

    yearlyEarningsCents = yearlyEarningsCents.plus(assetYearlyEarningsCents);
  });

  return yearlyEarningsCents;
};
