/** @jsxImportSource @emotion/react */
import { Select, TableRowProps } from 'components';
import React from 'react';
import { useTranslation } from 'translation';
import { UserMarket } from 'types';

import Path from 'constants/path';
import { MarketTable } from 'containers/MarketTable';
import { useShowMdDownCss } from 'hooks/responsive';

import { useStyles } from './styles';

export interface TableProps {
  markets: UserMarket[];
}

export const Table: React.FC<TableProps> = ({ markets }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const showMdDownCss = useShowMdDownCss();

  const getRowHref = (row: TableRowProps[]) =>
    Path.MARKET_ASSET.replace(':marketId', 'FAKE_MARKET_ID') // TODO: wire up
      .replace(':vTokenId', `${row[0].value}`);

  // TODO: add all options
  const mobileSelectOptions = [
    {
      value: 'liquidity',
      label: 'Liquidity',
    },
  ];

  return (
    <>
      {/* TODO: add logic to sort table on mobile */}
      <Select
        css={[styles.mobileSelect, showMdDownCss]}
        label={t('market.tables.mobileSelect.label')}
        title={t('market.tables.mobileSelect.title')}
        // TODO: wire up
        value={mobileSelectOptions[0].value}
        onChange={console.log}
        options={mobileSelectOptions}
        ariaLabel={t('market.tables.mobileSelect.ariaLabelFor')}
      />

      <MarketTable
        getRowHref={getRowHref}
        markets={markets}
        breakpoint="xl"
        columns={[
          'asset',
          'treasuryTotalSupply',
          'labeledSupplyApyLtv',
          'treasuryTotalBorrow',
          'labeledBorrowApy',
          'liquidity',
        ]}
        initialOrder={{
          orderBy: 'liquidity',
          orderDirection: 'desc',
        }}
      />
    </>
  );
};

export default Table;
