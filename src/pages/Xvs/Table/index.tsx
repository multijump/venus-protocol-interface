/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Table, TableProps, Token } from 'components';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'translation';
import { TokenId, UserAsset } from 'types';
import {
  convertWeiToTokens,
  formatToReadablePercentage,
  formatTokensToReadableValue,
  getContractAddress,
} from 'utilities';

import { useGetBalanceOf, useGetUserAssets, useGetVenusVaiVaultDailyRate } from 'clients/api';
import { DAYS_PER_YEAR } from 'constants/daysPerYear';
import { DEFAULT_REFETCH_INTERVAL_MS } from 'constants/defaultRefetchInterval';
import { TOKENS } from 'constants/tokens';
import { AuthContext } from 'context/AuthContext';

import { useStyles } from '../styles';

type TableAsset = Pick<UserAsset, 'id' | 'symbol'> & {
  supplyDailyXvsWei: UserAsset['supplyDailyXvsWei'] | undefined;
  borrowDailyXvsWei: UserAsset['borrowDailyXvsWei'] | undefined;
  xvsSupplyApy: UserAsset['xvsSupplyApy'] | undefined;
  xvsBorrowApy: UserAsset['xvsBorrowApy'] | undefined;
};

interface XvsTableProps {
  assets: TableAsset[];
}

const XvsTableUi: React.FC<XvsTableProps> = ({ assets }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const columns = useMemo(
    () => [
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
    ],
    [],
  );

  // Format assets to rows
  const rows: TableProps['data'] = assets.map(asset => {
    const xvsPerDay = convertWeiToTokens({
      valueWei: new BigNumber(asset?.supplyDailyXvsWei || 0).plus(
        new BigNumber(asset?.borrowDailyXvsWei || 0),
      ),
      tokenId: TOKENS.xvs.id as TokenId,
    });

    return [
      {
        key: 'asset',
        render: () => <Token tokenId={asset.id} />,
        value: asset.id,
        align: 'left',
      },
      {
        key: 'xvsPerDay',
        render: () => (
          <Typography variant="small1" css={[styles.whiteText, styles.fontWeight400]}>
            {formatTokensToReadableValue({
              value: xvsPerDay,
              tokenId: 'xvs',
              minimizeDecimals: true,
            })}
          </Typography>
        ),
        value: xvsPerDay?.toFixed() || 0,
        align: 'right',
      },
      {
        key: 'supplyXvsApy',
        render: () => (
          <Typography variant="small1" css={[styles.whiteText, styles.fontWeight400]}>
            {formatToReadablePercentage(asset.xvsSupplyApy)}
          </Typography>
        ),
        value: asset.xvsSupplyApy?.toFixed() || 0,
        align: 'right',
      },
      {
        key: 'borrowXvsApy',
        render: () => (
          <Typography variant="small1" css={[styles.whiteText, styles.fontWeight400]}>
            {formatToReadablePercentage(asset.xvsBorrowApy)}
          </Typography>
        ),
        value: asset.xvsBorrowApy?.toFixed() || 0,
        align: 'right',
      },
    ];
  });

  return (
    <Table
      columns={columns}
      data={rows}
      initialOrder={{
        orderBy: 'xvsPerDay',
        orderDirection: 'desc',
      }}
      rowKeyExtractor={row => `${row[0].value}`}
      breakpoint="sm"
      css={styles.cardContentGrid}
    />
  );
};

const XvsTable: React.FC = () => {
  const { account } = useContext(AuthContext);
  // TODO: handle loading state (see VEN-591)
  const {
    data: { assets },
  } = useGetUserAssets({
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
        .times(xvsAsset.tokenPriceDollars)
        .times(DAYS_PER_YEAR)
        .times(100)
        .div(vaultVaiStakedTokens)
        .toNumber();

      allAssets.unshift({
        id: 'vai',
        symbol: 'VAI',
        supplyDailyXvsWei: venusVaiVaultDailyRateData.dailyRateWei,
        borrowDailyXvsWei: undefined,
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
