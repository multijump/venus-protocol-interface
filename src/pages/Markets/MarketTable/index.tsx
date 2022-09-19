/** @jsxImportSource @emotion/react */
import BigNumber from 'bignumber.js';
import { RiskLevel, Select, Table, TableProps, TokenGroup } from 'components';
import React, { useMemo } from 'react';
import { useTranslation } from 'translation';
import { Market } from 'types';
import { formatCentsToReadableValue } from 'utilities';

import { markets as fakeMarkets } from '__mocks__/models/markets';
import Path from 'constants/path';
import { useShowXxlDownCss } from 'hooks/responsive';

import { useStyles } from './styles';

export interface MarketTableProps {
  markets: Market[];
}

export const MarketTableUi: React.FC<MarketTableProps> = ({ markets }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const showXxlDownCss = useShowXxlDownCss();

  // TODO: add all options
  const mobileSelectOptions = [
    {
      value: 'riskLevel',
      label: 'Risk level',
    },
  ];

  const columns = useMemo(
    () => [
      { key: 'assets', label: t('markets.table.columns.assets'), orderable: false },
      { key: 'market', label: t('markets.table.columns.market'), orderable: true, align: 'right' },
      {
        key: 'riskLevel',
        label: t('markets.table.columns.riskLevel'),
        orderable: true,
        align: 'right',
      },
      {
        key: 'totalSupply',
        label: t('markets.table.columns.totalSupply'),
        orderable: true,
        align: 'right',
      },
      {
        key: 'totalBorrow',
        label: t('markets.table.columns.totalBorrow'),
        orderable: true,
        align: 'right',
      },
      {
        key: 'liquidity',
        label: t('markets.table.columns.liquidityCents'),
        orderable: true,
        align: 'right',
      },
    ],
    [],
  );

  // Format assets to rows
  const rows: TableProps['data'] = useMemo(
    () =>
      markets.map(market => {
        const { treasuryTotalSupplyCents, treasuryTotalBorrowsCents, liquidityCents } =
          market.assets.reduce(
            (acc, asset) => ({
              treasuryTotalSupplyCents: acc.treasuryTotalSupplyCents.plus(asset.totalSupplyCents),
              treasuryTotalBorrowsCents: acc.treasuryTotalBorrowsCents.plus(
                asset.totalBorrowsCents,
              ),
              liquidityCents: acc.liquidityCents.plus(asset.liquidityCents * 100),
            }),
            {
              treasuryTotalSupplyCents: new BigNumber(0),
              treasuryTotalBorrowsCents: new BigNumber(0),
              liquidityCents: new BigNumber(0),
            },
          );

        return [
          {
            key: 'assets',
            render: () => <TokenGroup tokenIds={market.assets.map(asset => asset.id)} limit={4} />,
            value: market.id,
          },
          {
            key: 'market',
            render: () => market.name,
            value: market.name,
            align: 'right',
          },
          {
            key: 'riskLevel',
            render: () => <RiskLevel variant={market.riskLevel} />,
            value: market.riskLevel,
            align: 'right',
          },
          {
            key: 'totalSupply',
            render: () =>
              formatCentsToReadableValue({
                value: treasuryTotalSupplyCents,
                shortenLargeValue: true,
              }),
            align: 'right',
            value: treasuryTotalSupplyCents.toFixed(),
          },
          {
            key: 'totalBorrow',
            render: () =>
              formatCentsToReadableValue({
                value: treasuryTotalBorrowsCents,
                shortenLargeValue: true,
              }),
            value: treasuryTotalBorrowsCents.toFixed(),
            align: 'right',
          },
          {
            key: 'liquidity',
            render: () =>
              formatCentsToReadableValue({
                value: liquidityCents,
                shortenLargeValue: true,
              }),
            value: liquidityCents.toFixed(),
            align: 'right',
          },
        ];
      }),
    [JSON.stringify(markets)],
  );

  return (
    <>
      <Select
        css={[styles.mobileSelect, showXxlDownCss]}
        label={t('markets.mobileSelect.label')}
        title={t('markets.mobileSelect.title')}
        // TODO: wire up
        value={mobileSelectOptions[0].value}
        onChange={console.log}
        options={mobileSelectOptions}
        ariaLabel={t('markets.mobileSelect.ariaLabelFor')}
      />

      <Table
        columns={columns}
        data={rows}
        initialOrder={{
          orderBy: 'liquidity',
          orderDirection: 'desc',
        }}
        rowKeyExtractor={row => `${row[0].value}`}
        getRowHref={row => Path.MARKET.replace(':marketId', `${row[0].value}`)}
        breakpoint="xxl"
        css={styles.cardContentGrid}
      />
    </>
  );
};

// TODO: fetch isolated lending assets
const MarketTable = () => <MarketTableUi markets={fakeMarkets} />;

export default MarketTable;
