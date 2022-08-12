/** @jsxImportSource @emotion/react */
import { ComponentMeta } from '@storybook/react';
import React from 'react';

import { withCenterStory, withThemeProvider } from 'stories/decorators';

import { Table } from '.';
import { columns, renderCell, rows, useTableStyles } from './storiesUtils';

export default {
  title: 'Components/Table',
  component: Table,
  decorators: [withCenterStory({ width: 800 }), withThemeProvider],
  parameters: {
    backgrounds: {
      default: 'White',
    },
  },
} as ComponentMeta<typeof Table>;

export const TableDefault = () => {
  const styles = useTableStyles();

  return (
    <Table
      data={rows}
      columns={columns}
      renderCell={renderCell}
      title="Market Data"
      minWidth="650px"
      keyExtractor={row => `table-key-${row.asset.value}`}
      tableCss={styles.tableCss}
      cardsCss={styles.cardsCss}
      css={styles.table}
    />
  );
};

export const WithInitialOrderDefault = () => {
  const styles = useTableStyles();

  return (
    <Table
      data={rows}
      columns={columns}
      renderCell={renderCell}
      title="Market Data"
      minWidth="650px"
      keyExtractor={row => `table-key-${row.asset.value}`}
      tableCss={styles.tableCss}
      cardsCss={styles.cardsCss}
      css={styles.table}
      initialOrder={{
        orderBy: 'apy',
        orderDirection: 'desc',
      }}
    />
  );
};

export const WithCustomColumnsWidth = () => {
  const styles = useTableStyles();

  return (
    <Table
      data={rows}
      columns={columns}
      renderCell={renderCell}
      title="Market Data"
      minWidth="650px"
      keyExtractor={row => `table-key-${row.asset.value}`}
      tableCss={styles.tableCss}
      cardsCss={styles.cardsCss}
      css={styles.table}
      gridTemplateColumnsCards="100px 1fr 1fr 140px"
    />
  );
};

export const WithMultipleRows = () => {
  const styles = useTableStyles();

  return (
    <Table
      data={rows}
      columns={columns}
      renderCell={renderCell}
      title="Market Data"
      minWidth="650px"
      keyExtractor={row => `table-key-${row.asset.value}`}
      tableCss={styles.tableCss}
      cardsCss={styles.cardsCss}
      css={[styles.table, styles.cardContentGrid]}
    />
  );
};
