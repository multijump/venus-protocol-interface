/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import {
  LayeredValues,
  ProgressBar,
  RiskLevel,
  TableProps,
  TableRowProps,
  Toggle,
  Token,
} from 'components';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'translation';
import { Asset, UserAsset } from 'types';
import {
  calculateCollateralValue,
  calculatePercentage,
  convertTokensToWei,
  formatCentsToReadableValue,
  formatToReadablePercentage,
  formatTokensToReadableValue,
} from 'utilities';

import PLACEHOLDER_KEY from 'constants/placeholderKey';
import { IncludeXvsContext } from 'context/IncludeXvsContext';

import { useStyles } from './styles';
import { ColumnName } from './types';

const useGenerateData = ({
  assets,
  columns,
  collateralOnChange,
}: {
  assets: Array<Asset | UserAsset>;
  columns: ColumnName[];
  collateralOnChange: (asset: UserAsset) => void;
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const { includeXvs } = useContext(IncludeXvsContext);

  // Calculate borrow limit of user if percentOfLimit column needs to be
  // rendered
  const userTotalBorrowLimitCents = useMemo(() => {
    if (!columns.includes('percentOfLimit')) {
      return 0;
    }

    return (
      assets
        .reduce((acc, asset) => {
          if (!('collateral' in asset) || !asset.collateral) {
            return acc;
          }

          // Add collateral value of supplied asset if it's been set as
          // collateral
          return acc.plus(
            calculateCollateralValue({
              amountWei: convertTokensToWei({
                value: asset.supplyBalanceTokens,
                tokenId: asset.id,
              }),
              tokenId: asset.id,
              tokenPriceDollars: asset.tokenPriceDollars,
              collateralFactor: asset.collateralFactor,
            }).times(100),
          );
        }, new BigNumber(0))
        // Convert BigNumber to number
        .toNumber()
    );
  }, [JSON.stringify(assets), columns.includes('percentOfLimit')]);

  const data: TableProps['data'] = assets.map(asset =>
    columns.map((column, index) => {
      const cell: TableRowProps = {
        key: column,
        align: index === 0 ? 'left' : 'right',
        render: () => null,
        value: '',
      };

      if (column === 'asset') {
        cell.render = () => <Token tokenId={asset.id} />;
        cell.value = asset.id;
      } else if (column === 'treasuryTotalBorrow') {
        cell.render = () =>
          formatCentsToReadableValue({
            value: asset.totalBorrowsCents,
            shortenLargeValue: true,
          });

        cell.value = asset.totalBorrowsCents.toFixed();
      } else if (column === 'treasuryTotalSupply') {
        cell.render = () =>
          formatCentsToReadableValue({
            value: asset.totalSupplyCents,
            shortenLargeValue: true,
          });

        cell.value = asset.totalSupplyCents.toFixed();
      } else if (column === 'liquidity') {
        cell.render = () =>
          formatCentsToReadableValue({
            value: asset.liquidityCents,
            shortenLargeValue: true,
          });
        cell.value = asset.liquidityCents;
      } else if (column === 'market') {
        cell.render = () => (
          <div>
            <Link to="/market/xvs" css={styles.marketLink}>
              {/* TODO: get from asset */}
              <Typography variant="small2">Venus</Typography>
            </Link>
          </div>
        );

        cell.value = 'venus'; // TODO: get from asset
      } else if (column === 'riskLevel') {
        // TODO: get from asset
        cell.render = () => <RiskLevel variant="MINIMAL" />;
        // TODO: get from asset
        cell.value = 'MINIMAL';
      } else if (column === 'borrowApy' || column === 'labeledBorrowApy') {
        const borrowApy = includeXvs ? asset.xvsBorrowApy + asset.borrowApy : asset.borrowApy;

        cell.render = () => formatToReadablePercentage(borrowApy);
        cell.value = borrowApy;
      } else if (column === 'supplyApyLtv' || column === 'labeledSupplyApyLtv') {
        const supplyApy = includeXvs ? asset.xvsSupplyApy + asset.supplyApy : asset.supplyApy;
        const ltv = +asset.collateralFactor * 100;

        cell.render = () => (
          <LayeredValues
            topValue={formatToReadablePercentage(supplyApy)}
            bottomValue={formatToReadablePercentage(ltv)}
          />
        );

        cell.value = supplyApy;
      }

      // Handle columns specific to UserAsset type.
      // Check that the asset passed is of type UserAsset, as otherwise it won't
      // contain the necessary data to render the requested columns
      if (!('collateral' in asset)) {
        return cell;
      }

      if (column === 'collateral') {
        cell.render = () =>
          asset.collateralFactor.toNumber() || asset.collateral ? (
            <Toggle onChange={() => collateralOnChange(asset)} value={asset.collateral} />
          ) : (
            PLACEHOLDER_KEY
          );

        cell.value = asset.collateral;
      } else if (column === 'walletBalance') {
        cell.render = () =>
          formatTokensToReadableValue({
            value: asset.walletBalanceTokens,
            tokenId: asset.id,
            minimizeDecimals: true,
          });

        cell.value = asset.walletBalanceTokens.toFixed();
      } else if (column === 'supplyBalance') {
        cell.render = () =>
          formatTokensToReadableValue({
            value: asset.supplyBalanceTokens,
            tokenId: asset.id,
            minimizeDecimals: true,
          });

        cell.value = asset.supplyBalanceTokens.toFixed();
      } else if (column === 'borrowBalance') {
        cell.render = () =>
          formatTokensToReadableValue({
            value: asset.borrowBalanceTokens,
            tokenId: asset.id,
            minimizeDecimals: true,
          });

        cell.value = asset.borrowBalanceTokens.toFixed();
      } else if (column === 'percentOfLimit') {
        const percentOfLimit = calculatePercentage({
          numerator: +asset.borrowBalanceTokens.multipliedBy(asset.tokenPriceDollars).times(100),
          denominator: +userTotalBorrowLimitCents,
        });

        cell.render = () => (
          <div css={styles.percentOfLimit}>
            <ProgressBar
              min={0}
              max={100}
              value={percentOfLimit}
              step={1}
              ariaLabel={t('marketTable.columns.percentOfLimit')}
              css={styles.percentOfLimitProgressBar}
            />

            <Typography variant="small2" css={styles.white}>
              {formatToReadablePercentage(percentOfLimit)}
            </Typography>
          </div>
        );

        cell.value = percentOfLimit;
      }

      return cell;
    }),
  );

  return data;
};

export default useGenerateData;
