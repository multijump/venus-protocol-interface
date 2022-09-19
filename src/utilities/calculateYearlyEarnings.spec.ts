import { UserAsset } from 'types';

import { userAssets as assets } from '__mocks__/models/userAssets';

import {
  calculateYearlyEarningsForAsset,
  calculateYearlyEarningsForAssets,
} from './calculateYearlyEarnings';

describe('utilities/calculateYearlyEarnings', () => {
  test('calculates yearly Earnings for single asset', () => {
    const earnings = calculateYearlyEarningsForAsset({
      asset: assets[0] as UserAsset,
      includeXvs: false,
    });

    expect(earnings.toFixed()).toMatchInlineSnapshot('"-20.275471661046025201747490072808"');
  });

  test('calculates yearly Earnings for single asset, including XVS distribution', () => {
    const earnings = calculateYearlyEarningsForAsset({
      asset: assets[0] as UserAsset,
      includeXvs: true,
    });

    expect(earnings.toFixed()).toMatchInlineSnapshot(
      '"-20.297949999843323494392992231102703076314522528"',
    );
  });

  test('calculates yearly Earnings for array of assets', () => {
    const earnings = calculateYearlyEarningsForAssets({
      assets: assets as UserAsset[],
      includeXvs: false,
    });
    expect(earnings?.toFixed()).toMatchInlineSnapshot(
      '"3434846512.239314931063164396694169724808921405039255"',
    );
  });

  test('calculates yearly Earnings for array of assets, including XVS distribution', () => {
    const earnings = calculateYearlyEarningsForAssets({
      assets: assets as UserAsset[],
      includeXvs: true,
    });

    expect(earnings?.toFixed()).toMatchInlineSnapshot(
      '"3435202090.4485490373637295288358258243723818387679114173567980261331849"',
    );
  });
});
