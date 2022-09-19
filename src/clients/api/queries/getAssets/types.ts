import BigNumber from 'bignumber.js';
import { Asset } from 'types';

export interface ApiAsset {
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
  underlyingDecimal: number;
  underlyingName: string;
  underlyingPrice: string;
  underlyingSymbol: string;
  venusBorrowIndex: string;
  venusSpeeds: string;
  venusSupplyIndex: string;
}

export interface GetAssetsResponse {
  dailyVenus: number;
  markets: ApiAsset[];
  request: { addresses: string[] };
  venusRate: string;
}

export interface GetAssetsOutput {
  assets: Asset[];
  dailyXvsDistributedWei: BigNumber | undefined;
}
