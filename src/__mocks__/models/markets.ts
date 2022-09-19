import { Market } from 'types';

import { assets } from './assets';

export const markets: Market[] = [
  {
    id: '1',
    riskLevel: 'MINIMAL',
    name: 'Venus',
    assets,
  },
  {
    id: '2',
    riskLevel: 'VERY_HIGH',
    name: 'Gaming',
    assets,
  },
  {
    id: '3',
    riskLevel: 'MEDIUM',
    name: 'MetaVerse',
    assets,
  },
];
