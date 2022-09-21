import BigNumber from 'bignumber.js';
import { Market } from 'types';

export interface ApiMarket {
  address: string;
  borrowApy: string | number;
  borrowCaps: string;
  borrowRatePerBlock: string;
  borrowVenusApr: string | number;
  borrowVenusApy: string | number;
  borrowerCount: number;
  borrowerDailyVenus: string;
  cash: string;
  collateralFactor: string;
  exchangeRate: string;
  lastCalculatedBlockNumber: number;
  liquidity: string;
  name: string;
  reserveFactor: string;
  supplierCount: number;
  supplierDailyVenus: string;
  supplyApy: string | number;
  supplyRatePerBlock: string;
  supplyVenusApy: string;
  supplyVenusApr: string;
  symbol: string;
  tokenPrice: string;
  totalBorrows: string;
  totalBorrows2: string;
  totalBorrowsUsd: string;
  totalDistributed: string;
  totalDistributed2: string;
  totalReserves: string;
  totalSupply: string;
  totalSupply2: string;
  totalSupplyUsd: string;
  underlyingAddress: string | null;
  underlyingDecimals: number;
  underlyingName: string;
  underlyingPrice: string;
  underlyingSymbol: string;
  venusBorrowIndex: string;
  venusSpeeds: string;
  venusSupplyIndex: string;
}

export interface GetMarketsResponse {
  dailyVenus: number;
  markets: ApiMarket[];
  request: { addresses: string[] };
  venusRate: string;
}

export interface GetMarketsOutput {
  markets: Market[];
  dailyXvsDistributedWei: BigNumber | undefined;
}
