/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTheme } from '@mui/material';
import React from 'react';
import { TokenId } from 'types';
import { formatToReadablePercentage, getToken } from 'utilities';

import { Icon } from '../Icon';
import { Toggle } from '../Toggle';
import { TableColumnProps } from './types';

export const useTableStyles = () => {
  const theme = useTheme();

  return {
    table: css`
      h4 {
        display: initial;
        ${theme.breakpoints.down('lg')} {
          display: none;
        }
        ${theme.breakpoints.down('sm')} {
          display: initial;
        }
      }
    `,
    tableCss: css`
      display: initial;
      ${theme.breakpoints.down('sm')} {
        display: none;
      }
    `,
    cardsCss: css`
      display: none;

      ${theme.breakpoints.down('sm')} {
        display: initial;
      }
    `,

    /* multiple rows styles */

    cardContentGrid: `
      .table__table-cards__card-content {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        row-gap: 20px;
    `,
  };
};

export const rows = [
  {
    asset: {
      value: 'sxp',
    },
    apy: {
      value: 0.18,
    },
    wallet: { value: 0 },
    collateral: {
      value: true,
    },
  },
  {
    asset: {
      value: 'usdc',
    },
    apy: {
      value: 12.05,
    },
    wallet: { value: 90 },
    collateral: {
      value: false,
    },
  },
  {
    asset: {
      value: 'usdt',
    },
    apy: {
      value: 0.8,
    },
    wallet: { value: 160 },
    collateral: {
      value: true,
    },
  },
  {
    asset: {
      value: 'bnb',
    },
    apy: {
      value: 1.18,
    },
    wallet: { value: 37 },
    collateral: {
      value: false,
    },
  },
  {
    asset: {
      value: 'xvs',
    },
    apy: {
      value: 0.15,
    },
    wallet: { value: 160 },
    collateral: {
      value: false,
    },
  },
];

type RowType = typeof rows[number];

const styles = {
  asset: css`
    display: flex;
    align-items: center;
    img {
      height: 18px;
      width: 18px;
      margin-right: 4px;
    }
    span {
      display: flex;
      justify-self: flex-end;
    }
  `,
  apy: css`
    color: #18df8b;
    svg {
      margin-right: 12px;
      fill: #18df8b;
    }
  `,
};

export const renderCell = ({ row, columnKey }: { row: RowType; columnKey: keyof RowType }) => {
  if (columnKey === 'asset') {
    return (
      <div css={styles.asset}>
        <img src={getToken(row.asset.value as TokenId).asset} alt={row.asset.value} />
        <span>{row.asset.value.toUpperCase()}</span>
      </div>
    );
  }

  if (columnKey === 'apy') {
    return (
      <div css={styles.apy}>
        <Icon name="longArrow" size="12px" />
        {formatToReadablePercentage(row.apy.value)} {row.asset.value.toUpperCase()}
      </div>
    );
  }

  if (columnKey === 'wallet') {
    return `${row.wallet.value} ${row.asset.value}`;
  }

  return <Toggle onChange={console.log} value={row.collateral.value} />;
};

export const columns: TableColumnProps<RowType>[] = [
  { key: 'asset', label: 'Asset', orderable: false },
  { key: 'apy', label: 'APY', orderable: true },
  { key: 'wallet', label: 'Wallet', orderable: true },
  { key: 'collateral', label: 'Collateral', orderable: true },
];
