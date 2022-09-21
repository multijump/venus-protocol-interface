import BigNumber from 'bignumber.js';
import { Market } from 'types';
import { restService } from 'utilities';

import formatToAsset from './formatToMarket';
import { GetMarketsOutput, GetMarketsResponse } from './types';

export * from './types';

export { default as formatToAsset } from './formatToMarket';

const getMarkets = async (): Promise<GetMarketsOutput> => {
  const response = await restService<GetMarketsResponse>({
    endpoint: '/governance/venus',
    method: 'GET',
  });

  if ('result' in response && response.result === 'error') {
    throw new Error(response.message);
  }

  let markets: Market[] = [];
  let dailyXvsDistributedWei;

  if (response && response.data && response.data.data) {
    dailyXvsDistributedWei = new BigNumber(response.data.data.dailyVenus);

    markets = response.data?.data.markets
      .map(formatToAsset)
      // Remove undefined values
      .filter(market => !!market) as Market[];
  }

  return { markets, dailyXvsDistributedWei };
};

export default getMarkets;
