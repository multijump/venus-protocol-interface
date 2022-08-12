/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Table, TableAlign, Token } from 'components';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'translation';
import { Asset } from 'types';
import {
  convertWeiToTokens,
  formatToReadablePercentage,
  formatTokensToReadableValue,
  getContractAddress,
} from 'utilities';

import { useGetBalanceOf, useGetUserMarketInfo, useGetVenusVaiVaultDailyRate } from 'clients/api';
import { DAYS_PER_YEAR } from 'constants/daysPerYear';
import { DEFAULT_REFETCH_INTERVAL_MS } from 'constants/defaultRefetchInterval';
import { AuthContext } from 'context/AuthContext';

import { useStyles } from '../styles';

type TableAsset = Pick<Asset, 'id' | 'symbol'> & {
  xvsPerDay: Asset['xvsPerDay'] | undefined;
  xvsSupplyApy: Asset['xvsSupplyApy'] | undefined;
  xvsBorrowApy: Asset['xvsBorrowApy'] | undefined;
};

interface XvsTableProps {
  assets: TableAsset[];
}

const XvsTableUi: React.FC<XvsTableProps> = ({ assets }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  // Format assets to rows
  const rows = useMemo(
    () =>
      assets.map(asset => ({
        asset: {
          value: asset.id,
          align: 'left' as TableAlign,
        },
        xvsPerDay: {
          value: asset.xvsPerDay?.toFixed() || 0,
          align: 'right' as TableAlign,
        },
        supplyXvsApy: {
          value: asset.xvsSupplyApy?.toFixed() || 0,
          align: 'right' as TableAlign,
        },
        borrowXvsApy: {
          value: asset.xvsBorrowApy?.toFixed() || 0,
          align: 'right' as TableAlign,
        },
      })),
    [JSON.stringify(assets)],
  );

  const renderCell = ({
    row,
    columnKey,
  }: {
    row: typeof rows[number];
    columnKey: keyof typeof rows[number];
  }) => {
    if (columnKey === 'asset') {
      return <Token tokenId={row.asset.value} />;
    }

    if (columnKey === 'xvsPerDay') {
      return (
        <Typography variant="small1" css={[styles.whiteText, styles.fontWeight400]}>
          {formatTokensToReadableValue({
            value: new BigNumber(row.xvsPerDay.value),
            tokenId: 'xvs',
            minimizeDecimals: true,
          })}
        </Typography>
      );
    }

    if (columnKey === 'supplyXvsApy') {
      return (
        <Typography variant="small1" css={[styles.whiteText, styles.fontWeight400]}>
          {formatToReadablePercentage(row.supplyXvsApy.value)}
        </Typography>
      );
    }

    if (columnKey === 'borrowXvsApy') {
      return (
        <Typography variant="small1" css={[styles.whiteText, styles.fontWeight400]}>
          {formatToReadablePercentage(row.borrowXvsApy.value)}
        </Typography>
      );
    }
  };

  return (
    <Table
      data={rows}
      columns={[
        { key: 'asset', label: t('xvs.columns.asset'), orderable: false, align: 'left' },
        { key: 'xvsPerDay', label: t('xvs.columns.xvsPerDay'), orderable: true, align: 'right' },
        {
          key: 'supplyXvsApy',
          label: t('xvs.columns.supplyXvsApy'),
          orderable: true,
          align: 'right',
        },
        {
          key: 'borrowXvsApy',
          label: t('xvs.columns.borrowXvsApy'),
          orderable: true,
          align: 'right',
        },
      ]}
      renderCell={renderCell}
      initialOrder={{
        orderBy: 'xvsPerDay',
        orderDirection: 'desc',
      }}
      keyExtractor={row => `xvs-table-row-${row}`}
      tableCss={styles.table}
      cardsCss={styles.cards}
      css={styles.cardContentGrid}
    />
  );
};

const XvsTable: React.FC = () => {
  const { account } = useContext(AuthContext);
  // TODO: handle loading state (see https://app.clickup.com/t/2d4rcee)
  const {
    data: { assets },
  } = useGetUserMarketInfo({
    accountAddress: account?.address,
  });

  const { data: venusVaiVaultDailyRateData } = useGetVenusVaiVaultDailyRate();

  const { data: vaultVaiStakedData } = useGetBalanceOf(
    {
      tokenId: 'vai',
      accountAddress: getContractAddress('vaiVault'),
    },
    {
      refetchInterval: DEFAULT_REFETCH_INTERVAL_MS,
    },
  );

  const assetsWithVai = useMemo(() => {
    const allAssets: TableAsset[] = [...assets];
    const xvsAsset = assets.find(asset => asset.id === 'xvs');

    if (venusVaiVaultDailyRateData && vaultVaiStakedData && xvsAsset) {
      const venusVaiVaultDailyRateTokens = convertWeiToTokens({
        valueWei: venusVaiVaultDailyRateData.dailyRateWei,
        tokenId: 'xvs',
      });

      const vaultVaiStakedTokens = convertWeiToTokens({
        valueWei: vaultVaiStakedData.balanceWei,
        tokenId: 'vai',
      });

      const vaiApy = venusVaiVaultDailyRateTokens
        .times(xvsAsset.tokenPrice)
        .times(DAYS_PER_YEAR)
        .times(100)
        .div(vaultVaiStakedTokens);

      allAssets.unshift({
        id: 'vai',
        symbol: 'VAI',
        xvsPerDay: venusVaiVaultDailyRateTokens,
        xvsSupplyApy: vaiApy,
        xvsBorrowApy: undefined,
      });
    }

    return allAssets;
  }, [
    JSON.stringify(assets),
    venusVaiVaultDailyRateData?.dailyRateWei.toFixed(),
    vaultVaiStakedData?.balanceWei.toFixed(),
  ]);

  return <XvsTableUi assets={assetsWithVai} />;
};

export default XvsTable;
