import { UserMarket } from 'types';

import { assetData as markets } from '__mocks__/models/asset';

import {
  calculateYearlyEarningsForAsset,
  calculateYearlyEarningsForAssets,
} from './calculateYearlyEarnings';

describe('utilities/calculateYearlyEarnings', () => {
  test('calculates yearly Earnings for single asset', () => {
    const earnings = calculateYearlyEarningsForAsset({
      market: markets[0] as UserMarket,
      includeXvs: false,
    });

    expect(earnings.toFixed()).toMatchInlineSnapshot('"6.01347989955426636283938"');
  });

  test('calculates yearly Earnings for single asset, including XVS distribution', () => {
    const earnings = calculateYearlyEarningsForAsset({
      market: markets[0] as UserMarket,
      includeXvs: true,
    });

    expect(earnings.toFixed()).toMatchInlineSnapshot(
      '"6.014514624212835039288069236840175305250048"',
    );
  });

  test('calculates yearly Earnings for array of markets', () => {
    const earnings = calculateYearlyEarningsForAssets({
      markets: markets as UserMarket[],
      includeXvs: false,
    });
    expect(earnings?.toFixed()).toMatchInlineSnapshot('"-6.8460208090305522483859"');
  });

  test('calculates yearly Earnings for array of markets, including XVS distribution', () => {
    const earnings = calculateYearlyEarningsForAssets({
      markets: markets as UserMarket[],
      includeXvs: true,
    });

    expect(earnings?.toFixed()).toMatchInlineSnapshot(
      '"-4.1235060802240148531257692837859376156813296"',
    );
  });
});
