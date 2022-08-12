/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import { LayeredValues, Table, TableAlign, TableColumnProps, Token } from 'components';
import React, { useMemo } from 'react';
import { useTranslation } from 'translation';
import { Market, TokenId } from 'types';
import {
  convertPercentageFromSmartContract,
  formatCentsToReadableValue,
  formatToReadablePercentage,
  formatTokensToReadableValue,
} from 'utilities';

import { useGetMarkets } from 'clients/api';

import { useStyles as useSharedStyles } from '../styles';
import { useStyles as useLocalStyles } from './styles';

export interface MarketTableProps {
  markets: Market[];
  isInitialLoading: boolean;
}

export const MarketTableUi: React.FC<MarketTableProps> = ({ markets, isInitialLoading }) => {
  const { t } = useTranslation();
  const sharedStyles = useSharedStyles();
  const localStyles = useLocalStyles();

  // Format markets to rows
  const rows = useMemo(
    () =>
      markets.map(market => ({
        asset: {
          value: market.id,
          market,
        },
        totalSupply: {
          value: market.treasuryTotalSupplyCents.toFixed(),
          align: 'right' as TableAlign,
        },
        supplyApy: {
          value: market.supplyApy.plus(market.supplyVenusApy).toFixed(),
          align: 'right' as TableAlign,
        },
        totalBorrows: {
          value: market.treasuryTotalBorrowsCents.toFixed(),
          align: 'right' as TableAlign,
        },
        borrowApy: {
          value: market.borrowApy.plus(market.borrowVenusApy).toFixed(),
          align: 'right' as TableAlign,
        },
        liquidity: {
          value: market.liquidity.toFixed(),
          align: 'right' as TableAlign,
        },
        collateralFactor: {
          value: market.collateralFactor,
          align: 'right' as TableAlign,
        },
        price: {
          value: market.tokenPrice.toFixed(),
          align: 'right' as TableAlign,
        },
      })),
    [JSON.stringify(markets)],
  );

  const columns: TableColumnProps<typeof rows[number]>[] = useMemo(
    () => [
      {
        key: 'asset',
        label: t('market.columns.asset'),
        orderable: false,
        align: 'left' as TableAlign,
      },
      {
        key: 'totalSupply',
        label: t('market.columns.totalSupply'),
        orderable: true,
        align: 'right' as TableAlign,
      },
      {
        key: 'supplyApy',
        label: t('market.columns.supplyApy'),
        orderable: true,
        align: 'right' as TableAlign,
      },
      {
        key: 'totalBorrows',
        label: t('market.columns.totalBorrow'),
        orderable: true,
        align: 'right' as TableAlign,
      },
      {
        key: 'borrowApy',
        label: t('market.columns.borrowApy'),
        orderable: true,
        align: 'right' as TableAlign,
      },
      {
        key: 'liquidity',
        label: t('market.columns.liquidity'),
        orderable: true,
        align: 'right' as TableAlign,
      },
      {
        key: 'collateralFactor',
        label: t('market.columns.collateralFactor'),
        orderable: true,
        align: 'right' as TableAlign,
      },
      {
        key: 'price',
        label: t('market.columns.price'),
        orderable: true,
        align: 'right' as TableAlign,
      },
    ],
    [],
  );

  const cardColumns = useMemo(() => {
    const newColumns = [...columns];
    const [liquidityCol] = newColumns.splice(5, 1);
    newColumns.splice(3, 0, liquidityCol);
    return newColumns;
  }, [columns]);

  const renderCell = ({
    row,
    columnKey,
  }: {
    row: typeof rows[number];
    columnKey: keyof typeof rows[number];
  }) => {
    if (columnKey === 'asset') {
      return <Token tokenId={row.asset.market.id} css={localStyles.whiteText} />;
    }

    if (columnKey === 'totalSupply') {
      return (
        <LayeredValues
          topValue={formatCentsToReadableValue({
            value: row.asset.market.treasuryTotalSupplyCents,
            shortenLargeValue: true,
          })}
          bottomValue={formatTokensToReadableValue({
            value: row.asset.market.treasuryTotalSupplyCents.div(
              row.asset.market.tokenPrice.times(100),
            ),
            tokenId: row.asset.market.id as TokenId,
            minimizeDecimals: true,
            shortenLargeValue: true,
          })}
          css={localStyles.noWrap}
        />
      );
    }

    if (columnKey === 'supplyApy') {
      return (
        <LayeredValues
          topValue={formatToReadablePercentage(
            row.asset.market.supplyApy.plus(row.asset.market.supplyVenusApy),
          )}
          bottomValue={formatToReadablePercentage(row.asset.market.supplyVenusApy)}
        />
      );
    }

    if (columnKey === 'totalBorrows') {
      return (
        <LayeredValues
          topValue={formatCentsToReadableValue({
            value: row.asset.market.treasuryTotalBorrowsCents,
            shortenLargeValue: true,
          })}
          bottomValue={formatTokensToReadableValue({
            value: row.asset.market.treasuryTotalBorrowsCents.div(
              row.asset.market.tokenPrice.times(100),
            ),
            tokenId: row.asset.market.id,
            minimizeDecimals: true,
            shortenLargeValue: true,
          })}
          css={localStyles.noWrap}
        />
      );
    }

    if (columnKey === 'borrowApy') {
      return (
        <LayeredValues
          topValue={formatToReadablePercentage(
            row.asset.market.borrowApy.plus(row.asset.market.borrowVenusApy),
          )}
          bottomValue={formatToReadablePercentage(row.asset.market.borrowVenusApy)}
        />
      );
    }

    if (columnKey === 'liquidity') {
      return (
        <Typography variant="small1" css={localStyles.whiteText}>
          {formatCentsToReadableValue({
            value: row.asset.market.liquidity.multipliedBy(100),
            shortenLargeValue: true,
          })}
        </Typography>
      );
    }

    if (columnKey === 'collateralFactor') {
      return (
        <Typography variant="small1" css={localStyles.whiteText}>
          {formatToReadablePercentage(
            convertPercentageFromSmartContract(row.asset.market.collateralFactor),
          )}
        </Typography>
      );
    }

    if (columnKey === 'price') {
      return (
        <Typography variant="small1" css={localStyles.whiteText}>
          {formatCentsToReadableValue({ value: row.asset.market.tokenPrice.multipliedBy(100) })}
        </Typography>
      );
    }
  };

  const getRowHref = (row: typeof rows[number]) => `/market/${row.asset.value}`;

  return (
    <Table
      data={rows}
      columns={columns}
      cardColumns={cardColumns}
      renderCell={renderCell}
      initialOrder={{
        orderBy: 'asset',
        orderDirection: 'desc',
      }}
      keyExtractor={row => `market-row-${row.asset.value}`}
      isFetching={isInitialLoading}
      getRowHref={getRowHref}
      tableCss={sharedStyles.table}
      cardsCss={sharedStyles.cards}
      css={localStyles.cardContentGrid}
    />
  );
};

const MarketTable = () => {
  const {
    data: { markets } = { markets: [], dailyVenusWei: undefined },
    isLoading: isGetMarketsLoading,
  } = useGetMarkets({
    placeholderData: { markets: [], dailyVenusWei: undefined },
  });

  return <MarketTableUi markets={markets} isInitialLoading={isGetMarketsLoading} />;
};

export default MarketTable;
