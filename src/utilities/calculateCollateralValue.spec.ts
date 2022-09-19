import BigNumber from 'bignumber.js';

import { userAssets } from '__mocks__/models/userAssets';

import calculateCollateralValue from './calculateCollateralValue';

describe('utilities/calculateCollateralValue', () => {
  test('calculate collateral value for a given amount of an asset', () => {
    const collateralValue = calculateCollateralValue({
      amountWei: new BigNumber('100000000000000000'),
      tokenId: userAssets[0].id,
      tokenPriceDollars: userAssets[0].tokenPriceDollars,
      collateralFactor: userAssets[0].collateralFactor,
    });

    expect(collateralValue.toString()).toBe('80994331620');
  });
});
