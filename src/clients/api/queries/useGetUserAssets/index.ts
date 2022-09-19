import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Asset, TokenId, UserAsset } from 'types';
import {
  calculateCollateralValue,
  convertTokensToWei,
  convertWeiToTokens,
  indexBy,
} from 'utilities';

import {
  IGetVTokenBalancesAllOutput,
  useGetAssets,
  useGetAssetsInAccount,
  useGetMintedVai,
  useGetVTokenBalancesAll,
} from 'clients/api';
import { TOKENS, VBEP_TOKENS } from 'constants/tokens';

export interface Data {
  assets: UserAsset[];
  userTotalBorrowLimitCents: number;
  userTotalBorrowBalanceCents: number;
  userTotalSupplyBalanceCents: number;
  totalXvsDistributedWei: BigNumber;
  dailyXvsDistributedWei: BigNumber;
}

export interface UseGetUserAssetsOutput {
  isLoading: boolean;
  data: Data;
}

const vTokenAddresses: string[] = Object.values(VBEP_TOKENS).reduce(
  (acc, item) => (item.address ? [...acc, item.address] : acc),
  [],
);

// TODO: decouple, this hook handles too many things (see https://app.clickup.com/t/2d4rfx6)
const useGetUserAssets = ({
  accountAddress,
}: {
  accountAddress?: string;
}): UseGetUserAssetsOutput => {
  const { data: userMintedVaiData, isLoading: isGetUserMintedVaiLoading } = useGetMintedVai(
    {
      accountAddress: accountAddress || '',
    },
    {
      enabled: !!accountAddress,
    },
  );

  const {
    data: getAssetsData = {
      assets: [],
      dailyXvsDistributedWei: new BigNumber(0),
    },
    isLoading: isGetAssetsLoading,
  } = useGetAssets({
    placeholderData: {
      assets: [],
      dailyXvsDistributedWei: new BigNumber(0),
    },
  });

  const assetsMap = useMemo(
    () =>
      indexBy(
        (item: Asset) => item.underlyingSymbol.toLowerCase(), // index by symbol of underlying token
        getAssetsData.assets,
      ),
    [getAssetsData?.assets],
  );

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
      assets,
      userTotalBorrowBalanceCents,
      userTotalBorrowLimitCents,
      userTotalSupplyBalanceCents,
      totalXvsDistributedWei,
    } = getAssetsData.assets.reduce(
      (acc, asset) => {
        const { assets: userAssetAcc } = acc;

        const market = assetsMap[asset.id];

        const collateral = (assetsInAccount.tokenAddresses || [])
          .map((address: string) => address.toLowerCase())
          .includes(asset.address);

        let walletBalanceTokens = new BigNumber(0);
        let supplyBalanceTokens = new BigNumber(0);
        let borrowBalanceTokens = new BigNumber(0);

        const wallet = vTokenBalances && vTokenBalances[asset.address];

        if (accountAddress && wallet) {
          walletBalanceTokens = convertWeiToTokens({
            valueWei: new BigNumber(wallet.tokenBalance),
            tokenId: asset.id,
          });

          supplyBalanceTokens = convertWeiToTokens({
            valueWei: new BigNumber(wallet.balanceOfUnderlying),
            tokenId: asset.id,
          });

          borrowBalanceTokens = convertWeiToTokens({
            valueWei: new BigNumber(wallet.borrowBalanceCurrent),
            tokenId: asset.id,
          });
        }

        const userAsset: UserAsset = {
          ...asset,
          collateral,
          walletBalanceTokens,
          supplyBalanceTokens,
          borrowBalanceTokens,
          percentOfLimit: 0, // This is calculated afterwards
        };

        // User totals
        acc.userTotalBorrowBalanceCents += borrowBalanceTokens
          .times(asset.tokenPriceDollars)
          .times(100)
          .toNumber();

        acc.userTotalSupplyBalanceCents += supplyBalanceTokens
          .times(asset.tokenPriceDollars)
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
            amountWei: convertTokensToWei({ value: supplyBalanceTokens, tokenId: asset.id }),
            tokenId: asset.id,
            tokenPriceDollars: asset.tokenPriceDollars,
            collateralFactor: asset.collateralFactor,
          })
            .times(100)
            .toNumber();
        }

        return { ...acc, assets: [...userAssetAcc, userAsset] };
      },
      {
        assets: [] as UserAsset[],
        userTotalBorrowBalanceCents: 0,
        userTotalBorrowLimitCents: 0,
        userTotalSupplyBalanceCents: 0,
        totalXvsDistributedWei: new BigNumber(0),
      },
    );

    let assetList = assets;

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
    assetList = assetList.map((item: UserAsset) => ({
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
      assets: assetList,
      userTotalBorrowBalanceCents: userTotalBorrowBalanceWithUserMintedVai,
      userTotalBorrowLimitCents,
      userTotalSupplyBalanceCents,
      dailyXvsDistributedWei: getAssetsData.dailyXvsDistributedWei || new BigNumber(0),
      totalXvsDistributedWei,
    };
  }, [
    userMintedVaiData?.mintedVaiWei.toFixed(),
    JSON.stringify(assetsMap),
    JSON.stringify(assetsInAccount),
    JSON.stringify(vTokenBalances),
    JSON.stringify(getAssetsData),
  ]);

  return {
    isLoading,
    data,
    // TODO: handle errors and retry scenarios
  };
};

export default useGetUserAssets;
