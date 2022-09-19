import BigNumber from 'bignumber.js';
import { Asset } from 'types';
import { restService } from 'utilities';

import formatToAsset from './formatToAsset';
import { GetAssetsOutput, GetAssetsResponse } from './types';

export * from './types';

export { default as formatToAsset } from './formatToAsset';

const getAssets = async (): Promise<GetAssetsOutput> => {
  const response = await restService<GetAssetsResponse>({
    endpoint: '/governance/venus',
    method: 'GET',
  });

  if ('result' in response && response.result === 'error') {
    throw new Error(response.message);
  }

  let assets: Asset[] = [];
  let dailyXvsDistributedWei;

  if (response && response.data && response.data.data) {
    dailyXvsDistributedWei = new BigNumber(response.data.data.dailyVenus);

    assets = response.data?.data.markets
      .map(formatToAsset)
      // Remove undefined values
      .filter(asset => !!asset) as Asset[];
  }

  return { assets, dailyXvsDistributedWei };
};

export default getAssets;
