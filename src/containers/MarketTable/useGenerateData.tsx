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
import { UserMarket } from 'types';
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
  markets,
  columns,
  collateralOnChange,
}: {
  markets: UserMarket[];
  columns: ColumnName[];
  collateralOnChange: (asset: UserMarket) => void;
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
      markets
        .reduce((acc, asset) => {
          if (!asset.collateral) {
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
  }, [JSON.stringify(markets), columns.includes('percentOfLimit')]);

  const data: TableProps['data'] = markets.map(asset =>
    columns.map((column, index) => {
      const row: TableRowProps = {
        key: column,
        align: index === 0 ? 'left' : 'right',
        render: () => null,
        value: '',
      };

      if (column === 'asset') {
        row.render = () => <Token tokenId={asset.id} />;
        row.value = asset.id;
      } else if (column === 'borrowApy' || column === 'labeledBorrowApy') {
        const borrowApy = includeXvs ? asset.borrowXvsApy.plus(asset.borrowApy) : asset.borrowApy;

        row.render = () => formatToReadablePercentage(borrowApy);
        row.value = borrowApy.toNumber();
      } else if (column === 'supplyApyLtv' || column === 'labeledSupplyApyLtv') {
        const supplyApy = includeXvs ? asset.supplyXvsApy.plus(asset.supplyApy) : asset.supplyApy;
        const ltv = +asset.collateralFactor * 100;

        row.render = () => (
          <LayeredValues
            topValue={formatToReadablePercentage(supplyApy)}
            bottomValue={formatToReadablePercentage(ltv)}
          />
        );

        row.value = supplyApy.toNumber();
      } else if (column === 'collateral') {
        row.render = () =>
          asset.collateralFactor.toNumber() || asset.collateral ? (
            <Toggle onChange={() => collateralOnChange(asset)} value={asset.collateral} />
          ) : (
            PLACEHOLDER_KEY
          );

        row.value = asset.collateral;
      } else if (column === 'liquidity') {
        row.render = () =>
          formatCentsToReadableValue({
            value: asset.liquidityCents,
            shortenLargeValue: true,
          });
        row.value = asset.liquidityCents;
      } else if (column === 'market') {
        row.render = () => (
          <div>
            <Link to="/market/xvs" css={styles.marketLink}>
              {/* TODO: get from asset */}
              <Typography variant="small2">Venus</Typography>
            </Link>
          </div>
        );

        row.value = 'venus'; // TODO: get from asset
      } else if (column === 'riskLevel') {
        // TODO: get from asset
        row.render = () => <RiskLevel variant="MINIMAL" />;
        // TODO: get from asset
        row.value = 'MINIMAL';
      } else if (column === 'walletBalance') {
        row.render = () =>
          formatTokensToReadableValue({
            value: asset.walletBalanceTokens,
            tokenId: asset.id,
            minimizeDecimals: true,
          });

        row.value = asset.walletBalanceTokens.toFixed();
      } else if (column === 'supplyBalance') {
        row.render = () =>
          formatTokensToReadableValue({
            value: asset.supplyBalanceTokens,
            tokenId: asset.id,
            minimizeDecimals: true,
          });

        row.value = asset.supplyBalanceTokens.toFixed();
      } else if (column === 'borrowBalance') {
        row.render = () =>
          formatTokensToReadableValue({
            value: asset.borrowBalanceTokens,
            tokenId: asset.id,
            minimizeDecimals: true,
          });

        row.value = asset.borrowBalanceTokens.toFixed();
      } else if (column === 'treasuryTotalBorrow') {
        row.render = () =>
          formatCentsToReadableValue({
            value: asset.totalBorrowsCents,
            shortenLargeValue: true,
          });

        row.value = asset.totalBorrowsCents.toFixed();
      } else if (column === 'treasuryTotalSupply') {
        row.render = () =>
          formatCentsToReadableValue({
            value: asset.totalSupplyCents,
            shortenLargeValue: true,
          });

        row.value = asset.totalSupplyCents.toFixed();
      } else if (column === 'percentOfLimit') {
        const percentOfLimit = calculatePercentage({
          numerator: +asset.borrowBalanceTokens.multipliedBy(asset.tokenPriceDollars).times(100),
          denominator: +userTotalBorrowLimitCents,
        });

        row.render = () => (
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

        row.value = percentOfLimit;
      }

      return row;
    }),
  );

  return data;
};

export default useGenerateData;
