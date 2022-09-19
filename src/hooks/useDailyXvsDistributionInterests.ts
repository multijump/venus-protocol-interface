import { BigNumber } from 'bignumber.js';
import { useContext, useMemo } from 'react';
import { convertWeiToTokens } from 'utilities';

import { useGetAssets, useGetDailyXvs } from 'clients/api';
import { XVS_TOKEN_ID } from 'constants/xvs';
import { AuthContext } from 'context/AuthContext';

const useDailyXvsDistributionInterests = () => {
  const { account } = useContext(AuthContext);
  const { data: getDailyXvsData, isLoading: isGetDailyXvsLoading } = useGetDailyXvs(
    { accountAddress: account?.address || '' },
    { enabled: !!account?.address },
  );

  const { data: getMarketsData, isLoading: isGetAssetsLoading } = useGetAssets();
  const xvsPriceDollars: BigNumber | undefined = useMemo(
    () => (getMarketsData?.markets || []).find(market => market.id === XVS_TOKEN_ID)?.tokenPrice,
    [JSON.stringify(getMarketsData?.markets)],
  );

  const { dailyXvsDistributionInterestsCents } = useMemo(() => {
    const dailyXvsTokens =
      getDailyXvsData &&
      convertWeiToTokens({
        valueWei: getDailyXvsData.dailyXvsWei,
        tokenId: XVS_TOKEN_ID,
      });

    return {
      dailyXvsDistributionInterestsCents:
        account?.address && xvsPriceDollars
          ? dailyXvsTokens?.multipliedBy(xvsPriceDollars).times(100)
          : new BigNumber(0),
    };
  }, [
    JSON.stringify(getDailyXvsData?.dailyXvsWei),
    JSON.stringify(getMarketsData?.markets),
    account?.address,
  ]);

  return {
    isLoading: isGetDailyXvsLoading || isGetAssetsLoading,
    dailyXvsDistributionInterestsCents,
  };
};

export default useDailyXvsDistributionInterests;
