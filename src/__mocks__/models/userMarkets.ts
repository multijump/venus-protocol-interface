import { UserMarket } from 'types';

import { userAssets } from './userAssets';

export const userMarkets: UserMarket[] = [
  {
    id: '1',
    riskLevel: 'MINIMAL',
    name: 'Venus',
    assets: userAssets,
  },
  {
    id: '2',
    riskLevel: 'VERY_HIGH',
    name: 'Gaming',
    assets: userAssets,
  },
  {
    id: '3',
    riskLevel: 'MEDIUM',
    name: 'MetaVerse',
    assets: userAssets,
  },
];
