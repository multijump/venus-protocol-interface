import { Asset } from 'types';

import governanceResponse from '__mocks__/api/governance.json';
import { formatToAsset } from 'clients/api/queries/getAssets';

export const assets: Asset[] = governanceResponse.data.markets
  .map(formatToAsset)
  .filter(asset => !!asset) as Asset[];
