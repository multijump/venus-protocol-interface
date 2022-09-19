import BigNumber from 'bignumber.js';

import { TOKENS, VBEP_TOKENS } from 'constants/tokens';

export enum BscChainId {
  'MAINNET' = 56,
  'TESTNET' = 97,
}

export interface Asset {
  id: TokenId;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  tokenPriceDollars: number;
  borrowApy: number;
  borrowCapTokens: BigNumber;
  borrowRatePerBlock: BigNumber;
  xvsBorrowApr: number;
  xvsBorrowApy: number;
  borrowerCount: number;
  borrowDailyXvsWei: BigNumber;
  collateralFactor: BigNumber;
  exchangeRate: BigNumber;
  liquidityCents: number;
  reserveFactor: BigNumber;
  supplierCount: number;
  supplyDailyXvsWei: BigNumber;
  supplyApy: number;
  supplyRatePerBlock: BigNumber;
  xvsSupplyApy: number;
  xvsSupplyApr: number;
  totalBorrowsWei: BigNumber;
  totalBorrowsTokens: BigNumber;
  totalBorrowsCents: number;
  totalXvsDistributedWei: BigNumber;
  totalReservesWei: BigNumber;
  totalSupplyWei: BigNumber;
  totalSupplyTokens: BigNumber;
  totalSupplyCents: number;
  underlyingDecimals: number;
  underlyingName: string;
  underlyingPrice: number;
  underlyingSymbol: string;
  underlyingAddress?: string;
}

export interface UserAsset extends Asset {
  collateral: boolean;
  borrowBalanceTokens: BigNumber;
  walletBalanceTokens: BigNumber;
  supplyBalanceTokens: BigNumber;
  percentOfLimit: number;
}

export type TokenId = keyof typeof TOKENS;
export type VTokenId = keyof typeof VBEP_TOKENS;

export interface Token {
  id: TokenId;
  symbol: Uppercase<TokenId>;
  decimals: number;
  address: string | '';
  asset: string;
  vasset: string;
}

export interface VBepToken {
  id: VTokenId;
  symbol: `v${Uppercase<VTokenId>}`;
  address: string | '';
  decimals: number;
}

export interface Setting {
  marketType?: string; // 'supply'
  withXVS?: boolean;
  pendingInfo: {
    type: string; // 'Borrow'
    status: boolean;
    symbol: string;
    amount: string | number;
  };
  vaultVaiStaked?: BigNumber.Value | null;
  vaiAPY?: number | string;
}

export type ProposalState =
  | 'Pending'
  | 'Active'
  | 'Canceled'
  | 'Defeated'
  | 'Succeeded'
  | 'Queued'
  | 'Expired'
  | 'Executed';

export interface ProposalAction {
  callData: string;
  signature: string;
  target: string;
  value: string;
}

export interface DescriptionV2 {
  version: 'v2';
  title: string;
  description: string;
  forDescription: string;
  againstDescription: string;
  abstainDescription: string;
}

export interface DescriptionV1 {
  version: 'v1';
  title: string;
  description: string;
  forDescription?: undefined;
  againstDescription?: undefined;
  abstainDescription?: undefined;
}

export interface Proposal {
  abstainedVotesWei: BigNumber;
  againstVotesWei: BigNumber;
  createdDate: Date | undefined;
  description: DescriptionV1 | DescriptionV2;
  endBlock: number;
  executedDate: Date | undefined;
  forVotesWei: BigNumber;
  id: number;
  proposer: string;
  queuedDate: Date | undefined;
  startDate: Date | undefined;
  state: ProposalState;
  cancelDate: Date | undefined;
  createdTxHash: string | undefined;
  cancelTxHash: string | undefined;
  endTxHash: string | undefined;
  executedTxHash: string | undefined;
  queuedTxHash: string | undefined;
  startTxHash: string | undefined;
  totalVotesWei: BigNumber;
  actions: ProposalAction[];
  blockNumber?: number;
  endDate?: Date;
}

export type VoteSupport = 'FOR' | 'AGAINST' | 'ABSTAIN' | 'NOT_VOTED';

export interface VotersDetails {
  result: {
    address: string;
    voteWeightWei: BigNumber;
    reason?: string;
    support: VoteSupport;
  }[];
  sumVotes: {
    abstain: BigNumber;
    against: BigNumber;
    for: BigNumber;
    total: BigNumber;
  };
}

export interface VoteTransaction {
  support: boolean;
  type: 'vote';
  blockTimestamp: number;
  amount: string;
  to: string;
  votes: string;
}

export interface AssetSnapshot {
  asset: string;
  blockNumber: number;
  blockTimestamp: number;
  borrowApy: string;
  borrowVenusApy: string;
  createdAt: string;
  exchangeRate: string;
  id: string;
  priceUSD: string;
  supplyApy: string;
  supplyVenusApy: string;
  totalBorrow: string;
  totalSupply: string;
  updatedAt: string;
}

export type TransactionEvent =
  | 'Mint'
  | 'Transfer'
  | 'Borrow'
  | 'RepayBorrow'
  | 'Redeem'
  | 'Approval'
  | 'LiquidateBorrow'
  | 'ReservesAdded'
  | 'ReservesReduced'
  | 'MintVAI'
  | 'Withdraw'
  | 'RepayVAI'
  | 'Deposit'
  | 'VoteCast'
  | 'ProposalCreated'
  | 'ProposalQueued'
  | 'ProposalExecuted'
  | 'ProposalCanceled';

export enum TransactionCategory {
  vtoken = 'vtoken',
  vai = 'vai',
  vote = 'vote',
}

export interface Transaction {
  id: number;
  amountWei: BigNumber;
  blockNumber: number;
  category: TransactionCategory;
  createdAt: Date;
  event: TransactionEvent;
  from: string;
  to: string;
  timestamp: string | null;
  transactionHash: string;
  updatedAt: Date;
  vTokenAddress: string;
}

export interface Vault {
  stakedTokenId: TokenId;
  rewardTokenId: TokenId;
  stakingAprPercentage: number;
  totalStakedWei: BigNumber;
  dailyEmissionWei: BigNumber;
  lockingPeriodMs?: number;
  userStakedWei?: BigNumber;
  userPendingRewardWei?: BigNumber;
  poolIndex?: number;
}

export interface VoterAccount {
  address: string;
  createdAt: Date;
  id: string;
  proposalsVoted: number;
  updatedAt: Date;
  voteWeightPercent: number;
  votesWei: BigNumber;
}

export interface LockedDeposit {
  amountWei: BigNumber;
  unlockedAt: Date;
}

export type VoteDetailTransactionTransfer = {
  amountWei: BigNumber;
  blockNumber: number;
  blockTimestamp: Date;
  createdAt: Date;
  from: string;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: 'transfer';
  updatedAt: Date;
};

export type VoteDetailTransactionVote = {
  votesWei: BigNumber;
  blockNumber: number;
  blockTimestamp: Date;
  createdAt: Date;
  from: string;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: 'vote';
  updatedAt: Date;
  support: VoteSupport;
};

export type VoteDetailTransaction = VoteDetailTransactionTransfer | VoteDetailTransactionVote;

export interface VoterDetails {
  balanceWei: BigNumber;
  delegateCount: number;
  delegateAddress: string;
  delegating: boolean;
  votesWei: BigNumber;
  voterTransactions: VoteDetailTransaction[];
}

export interface VoterHistory {
  address: string;
  blockNumber: number;
  blockTimestamp: number;
  createdAt: Date;
  id: string;
  proposal: Proposal;
  reason: string | undefined;
  support: VoteSupport;
  updatedAt: Date;
  votesWei: BigNumber;
}

export type MarketRiskLevel = 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface Market {
  id: string;
  name: string;
  riskLevel: MarketRiskLevel;
  assets: Asset[];
}

export interface UserMarket {
  id: string;
  name: string;
  riskLevel: MarketRiskLevel;
  assets: UserAsset[];
}
