import BigNumber from 'bignumber.js';
import { Asset, VTokenId } from 'types';

import { COMPOUND_MANTISSA } from 'constants/compoundMantissa';
import { TOKENS, VBEP_TOKENS } from 'constants/tokens';

import { ApiAsset } from './types';

const formatToAsset = (apiAsset: ApiAsset): Asset | undefined => {
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
    borrowApy: +apiAsset.borrowApy,
    borrowCapTokens: new BigNumber(apiAsset.borrowCaps),
    borrowRatePerBlock: new BigNumber(apiAsset.borrowRatePerBlock),
    xvsBorrowApy: +apiAsset.borrowVenusApy,
    xvsBorrowApr: +apiAsset.borrowVenusApr,
    borrowerCount: +apiAsset.borrowerCount,
    borrowDailyXvsWei: new BigNumber(apiAsset.borrowerDailyVenus),
    collateralFactor: new BigNumber(apiAsset.collateralFactor).dividedBy(COMPOUND_MANTISSA),
    exchangeRate: new BigNumber(apiAsset.exchangeRate),
    liquidityCents: +apiAsset.liquidity * 100,
    reserveFactor: new BigNumber(apiAsset.reserveFactor).dividedBy(COMPOUND_MANTISSA),
    supplierCount: apiAsset.supplierCount,
    supplyDailyXvsWei: new BigNumber(apiAsset.supplierDailyVenus),
    supplyApy: +apiAsset.supplyApy,
    supplyRatePerBlock: new BigNumber(apiAsset.supplyRatePerBlock),
    xvsSupplyApy: +apiAsset.supplyVenusApy,
    xvsSupplyApr: +apiAsset.supplyVenusApr,
    tokenPriceDollars: +apiAsset.tokenPrice,
    totalBorrowsWei: new BigNumber(apiAsset.totalBorrows),
    totalBorrowsTokens: new BigNumber(apiAsset.totalBorrows2),
    totalBorrowsCents: +apiAsset.totalBorrowsUsd * 100,
    totalXvsDistributedWei: new BigNumber(apiAsset.totalDistributed2),
    totalReservesWei: new BigNumber(apiAsset.totalReserves),
    totalSupplyWei: new BigNumber(apiAsset.totalSupply),
    totalSupplyTokens: new BigNumber(apiAsset.totalSupply2),
    totalSupplyCents: +apiAsset.totalSupplyUsd * 100,
    underlyingDecimals: apiAsset.underlyingDecimal,
    underlyingName: apiAsset.underlyingName,
    underlyingPrice: +apiAsset.underlyingPrice,
    underlyingSymbol: apiAsset.underlyingSymbol,
    underlyingAddress: apiAsset.underlyingAddress ?? undefined,
  };
};

export default formatToAsset;
