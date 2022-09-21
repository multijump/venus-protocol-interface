import BigNumber from 'bignumber.js';
import { UserMarket } from 'types';

export const calculateYearlyEarningsForAsset = ({
  market,
  includeXvs,
}: {
  market: UserMarket;
  includeXvs: boolean;
}) => {
  const marketBorrowBalanceCents = market.borrowBalanceTokens
    .multipliedBy(market.tokenPriceDollars)
    .multipliedBy(100);
  const marketSupplyBalanceCents = market.supplyBalanceTokens
    .multipliedBy(market.tokenPriceDollars)
    .multipliedBy(100);

  const supplyYearlyEarningsCents = marketSupplyBalanceCents.multipliedBy(
    market.supplyApy.dividedBy(100),
  );
  // Note that borrowYearlyEarningsCents will always be negative (or 0), since
  // the borrow APY is expressed with a negative percentage)
  const borrowYearlyEarningsCents = marketBorrowBalanceCents.multipliedBy(
    market.borrowApy.dividedBy(100),
  );

  const yearlyEarningsCents = supplyYearlyEarningsCents.plus(borrowYearlyEarningsCents);

  if (!includeXvs || !market.supplyXvsApr.isFinite() || !market.borrowXvsApr.isFinite()) {
    return yearlyEarningsCents;
  }

  // Add earnings from XVS distribution
  const supplyYearlyXvsDistributionEarningsCents = supplyYearlyEarningsCents.multipliedBy(
    market.supplyXvsApr.dividedBy(100),
  );

  const borrowYearlyXvsDistributionEarningsCents = borrowYearlyEarningsCents.multipliedBy(
    market.borrowXvsApr.dividedBy(100),
  );

  return yearlyEarningsCents
    .plus(supplyYearlyXvsDistributionEarningsCents)
    .plus(borrowYearlyXvsDistributionEarningsCents);
};

export const calculateYearlyEarningsForAssets = ({
  markets,
  includeXvs,
}: {
  markets: UserMarket[];
  includeXvs: boolean;
}) => {
  // We use the yearly earnings to calculate the daily earnings the net APY
  let yearlyEarningsCents: BigNumber | undefined;

  markets.forEach(market => {
    if (!yearlyEarningsCents) {
      yearlyEarningsCents = new BigNumber(0);
    }

    const marketYearlyEarningsCents = calculateYearlyEarningsForAsset({
      market,
      includeXvs,
    });

    yearlyEarningsCents = yearlyEarningsCents.plus(marketYearlyEarningsCents);
  });

  return yearlyEarningsCents;
};
