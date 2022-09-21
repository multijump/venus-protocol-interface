import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { TokenId, UserMarket } from 'types';
import {
  calculateCollateralValue,
  convertTokensToWei,
  convertWeiToTokens,
  indexBy,
} from 'utilities';

import {
  IGetVTokenBalancesAllOutput,
  useGetAssetsInAccount,
  useGetMarkets,
  useGetMintedVai,
  useGetVTokenBalancesAll,
} from 'clients/api';
import { TOKENS, VBEP_TOKENS } from 'constants/tokens';

export interface Data {
  userMarkets: UserMarket[];
  userTotalBorrowLimitCents: number;
  userTotalBorrowBalanceCents: number;
  userTotalSupplyBalanceCents: number;
  totalXvsDistributedWei: BigNumber;
  dailyXvsDistributedWei: BigNumber;
}

export interface UseGetUserMarketsOutput {
  isLoading: boolean;
  data: Data;
}

const vTokenAddresses: string[] = Object.values(VBEP_TOKENS).reduce(
  (acc, item) => (item.address ? [...acc, item.address] : acc),
  [],
);

// TODO: decouple, this hook handles too many things (see https://app.clickup.com/t/2d4rfx6)
const useGetUserMarkets = ({
  accountAddress,
}: {
  accountAddress?: string;
}): UseGetUserMarketsOutput => {
  const { data: userMintedVaiData, isLoading: isGetUserMintedVaiLoading } = useGetMintedVai(
    {
      accountAddress: accountAddress || '',
    },
    {
      enabled: !!accountAddress,
    },
  );

  const {
    data: getMarketsData = {
      markets: [],
      dailyXvsDistributedWei: new BigNumber(0),
    },
    isLoading: isGetAssetsLoading,
  } = useGetMarkets({
    placeholderData: {
      markets: [],
      dailyXvsDistributedWei: new BigNumber(0),
    },
  });

  const {
    data: assetsInAccount = {
      tokenAddresses: [],
    },
    isLoading: isGetAssetsInAccountLoading,
  } = useGetAssetsInAccount(
    { accountAddress: accountAddress || '' },
    {
      enabled: !!accountAddress,
      placeholderData: {
        tokenAddresses: [],
      },
    },
  );

  const {
    data: vTokenBalancesAccount = { balances: [] },
    isLoading: isGetVTokenBalancesAccountLoading,
  } = useGetVTokenBalancesAll(
    { account: accountAddress || '', vTokenAddresses },
    { enabled: !!accountAddress, placeholderData: { balances: [] } },
  );

  const vTokenBalances = useMemo(
    () =>
      indexBy(
        (item: IGetVTokenBalancesAllOutput['balances'][number]) => item.vToken.toLowerCase(), // index by vToken address
        vTokenBalancesAccount.balances,
      ),
    [JSON.stringify(vTokenBalancesAccount)],
  );

  const isLoading =
    isGetAssetsLoading ||
    isGetAssetsInAccountLoading ||
    isGetVTokenBalancesAccountLoading ||
    isGetUserMintedVaiLoading;

  const data = useMemo(() => {
    const {
      userMarkets,
      userTotalBorrowBalanceCents,
      userTotalBorrowLimitCents,
      userTotalSupplyBalanceCents,
      totalXvsDistributedWei,
    } = getMarketsData.markets.reduce(
      (acc, market) => {
        const { userMarkets: userMarketsAcc } = acc;

        const collateral = (assetsInAccount.tokenAddresses || [])
          .map((address: string) => address.toLowerCase())
          .includes(market.address);

        let walletBalanceTokens = new BigNumber(0);
        let supplyBalanceTokens = new BigNumber(0);
        let borrowBalanceTokens = new BigNumber(0);

        const wallet = vTokenBalances && vTokenBalances[market.address];

        if (accountAddress && wallet) {
          walletBalanceTokens = convertWeiToTokens({
            valueWei: new BigNumber(wallet.tokenBalance),
            tokenId: market.id,
          });

          supplyBalanceTokens = convertWeiToTokens({
            valueWei: new BigNumber(wallet.balanceOfUnderlying),
            tokenId: market.id,
          });

          borrowBalanceTokens = convertWeiToTokens({
            valueWei: new BigNumber(wallet.borrowBalanceCurrent),
            tokenId: market.id,
          });
        }

        const userAsset: UserMarket = {
          ...market,
          collateral,
          walletBalanceTokens,
          supplyBalanceTokens,
          borrowBalanceTokens,
          percentOfLimit: 0, // This is calculated afterwards
        };

        // User totals
        acc.userTotalBorrowBalanceCents += borrowBalanceTokens
          .times(market.tokenPriceDollars)
          .times(100)
          .toNumber();

        acc.userTotalSupplyBalanceCents += supplyBalanceTokens
          .times(market.tokenPriceDollars)
          .times(100)
          .toNumber();

        // TODO: remove (only used on XVS page so calculation should happen
        // there using assets)
        acc.totalXvsDistributedWei = acc.totalXvsDistributedWei.plus(
          market?.totalXvsDistributedWei,
        );

        // Create borrow limit based on assets supplied as collateral
        if (collateral) {
          acc.userTotalBorrowLimitCents += calculateCollateralValue({
            amountWei: convertTokensToWei({ value: supplyBalanceTokens, tokenId: market.id }),
            tokenId: market.id,
            tokenPriceDollars: market.tokenPriceDollars,
            collateralFactor: market.collateralFactor,
          })
            .times(100)
            .toNumber();
        }

        return { ...acc, userMarkets: [...userMarketsAcc, userAsset] };
      },
      {
        userMarkets: [] as UserMarket[],
        userTotalBorrowBalanceCents: 0,
        userTotalBorrowLimitCents: 0,
        userTotalSupplyBalanceCents: 0,
        totalXvsDistributedWei: new BigNumber(0),
      },
    );

    let marketList = userMarkets;

    const userTotalBorrowBalanceWithUserMintedVai =
      userTotalBorrowBalanceCents +
      (userMintedVaiData
        ? convertWeiToTokens({
            valueWei: userMintedVaiData.mintedVaiWei,
            tokenId: TOKENS.vai.id as TokenId,
          })
            // Convert VAI to dollar cents (we assume 1 VAI = 1 dollar)
            .times(100)
            .toNumber()
        : 0);

    // percent of limit
    marketList = marketList.map((item: UserMarket) => ({
      ...item,
      percentOfLimit: new BigNumber(userTotalBorrowLimitCents).isZero()
        ? 0
        : item.borrowBalanceTokens
            .times(item.tokenPriceDollars)
            .div(userTotalBorrowLimitCents)
            .times(100)
            .dp(0, 1)
            .toNumber(),
    }));

    return {
      userMarkets: marketList,
      userTotalBorrowBalanceCents: userTotalBorrowBalanceWithUserMintedVai,
      userTotalBorrowLimitCents,
      userTotalSupplyBalanceCents,
      dailyXvsDistributedWei: getMarketsData.dailyXvsDistributedWei || new BigNumber(0),
      totalXvsDistributedWei,
    };
  }, [
    userMintedVaiData?.mintedVaiWei.toFixed(),
    JSON.stringify(assetsInAccount),
    JSON.stringify(vTokenBalances),
    JSON.stringify(getMarketsData),
  ]);

  return {
    isLoading,
    data,
    // TODO: handle errors and retry scenarios
  };
};

export default useGetUserMarkets;
