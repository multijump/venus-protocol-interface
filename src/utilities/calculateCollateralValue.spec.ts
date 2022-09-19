import BigNumber from 'bignumber.js';

import { userAssets } from '__mocks__/models/userAssets';

import calculateCollateralValue from './calculateCollateralValue';

describe('utilities/calculateCollateralValue', () => {
  test('calculate collateral value for a given amount of an asset', () => {
    const collateralValue = calculateCollateralValue({
      amountWei: new BigNumber('100000000000000000'),
      tokenId: userAssets[0].id,
      tokenPriceTokens: userAssets[0].tokenPrice,
      collateralFactor: userAssets[0].collateralFactor,
    });
    expect(collateralValue.toString()).toBe('0.06393367');
  });
});
