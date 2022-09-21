import BigNumber from 'bignumber.js';
import { Market, VTokenId } from 'types';

import { COMPOUND_MANTISSA } from 'constants/compoundMantissa';
import { TOKENS, VBEP_TOKENS } from 'constants/tokens';

import { ApiMarket } from './types';

const formatToMarket = (apiAsset: ApiMarket): Market | undefined => {
  const id = apiAsset.underlyingSymbol.toLowerCase() as VTokenId;
  const token = TOKENS[id];
  const vBepToken = VBEP_TOKENS[id];

  // Ignore unlisted tokens
  if (!token || !vBepToken) {
    return undefined;
  }

  return {
    id,
    name: apiAsset.name,
    symbol: apiAsset.symbol,
    address: apiAsset.address,
    decimals: token.decimals,
    borrowCapTokens: new BigNumber(apiAsset.borrowCaps),
    borrowRatePerBlock: new BigNumber(apiAsset.borrowRatePerBlock),
    borrowApy: new BigNumber(apiAsset.borrowApy),
    borrowXvsApy: new BigNumber(apiAsset.borrowVenusApy),
    borrowXvsApr: new BigNumber(apiAsset.borrowVenusApr),
    borrowerCount: +apiAsset.borrowerCount,
    borrowDailyXvsWei: new BigNumber(apiAsset.borrowerDailyVenus),
    collateralFactor: new BigNumber(apiAsset.collateralFactor).dividedBy(COMPOUND_MANTISSA),
    exchangeRate: new BigNumber(apiAsset.exchangeRate),
    liquidityCents: +apiAsset.liquidity * 100,
    reserveFactor: new BigNumber(apiAsset.reserveFactor).dividedBy(COMPOUND_MANTISSA),
    supplierCount: apiAsset.supplierCount,
    supplyDailyXvsWei: new BigNumber(apiAsset.supplierDailyVenus),
    supplyRatePerBlock: new BigNumber(apiAsset.supplyRatePerBlock),
    supplyApy: new BigNumber(apiAsset.supplyApy),
    supplyXvsApy: new BigNumber(apiAsset.supplyVenusApy),
    supplyXvsApr: new BigNumber(apiAsset.supplyVenusApr),
    tokenPriceDollars: +apiAsset.tokenPrice,
    totalBorrowsWei: new BigNumber(apiAsset.totalBorrows),
    totalBorrowsTokens: new BigNumber(apiAsset.totalBorrows2),
    totalBorrowsCents: +apiAsset.totalBorrowsUsd * 100,
    totalXvsDistributedWei: new BigNumber(apiAsset.totalDistributed2),
    totalReservesWei: new BigNumber(apiAsset.totalReserves),
    totalSupplyWei: new BigNumber(apiAsset.totalSupply),
    totalSupplyTokens: new BigNumber(apiAsset.totalSupply2),
    totalSupplyCents: +apiAsset.totalSupplyUsd * 100,
    underlyingDecimals: apiAsset.underlyingDecimals,
    underlyingName: apiAsset.underlyingName,
    underlyingSymbol: apiAsset.underlyingSymbol,
    underlyingAddress: apiAsset.underlyingAddress ?? undefined,
  };
};

export default formatToMarket;
