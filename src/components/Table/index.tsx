/** @jsxImportSource @emotion/react */
import { SerializedStyles } from '@emotion/react';
import Paper from '@mui/material/Paper';
import TableMUI from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import { Link } from 'react-router-dom';

import { Spinner } from '../Spinner';
import Head from './Head';
import TableCards from './TableCards';
import { useStyles } from './styles';
import { TableColumnProps, TableRowProps } from './types';

export interface TableBaseProps<T extends TableRowProps> {
  data: T[];
  keyExtractor: (row: T) => string;
  renderCell: ({
    row,
    columnKey,
  }: {
    row: T;
    columnKey: TableColumnProps<T>['key'];
  }) => React.ReactNode | string;
  columns: TableColumnProps<T>[];
  cardColumns?: TableColumnProps<T>[];
  rowOnClick?: (e: React.MouseEvent<HTMLDivElement>, row: T) => void;
  initialOrder?: {
    orderBy: keyof T;
    orderDirection: 'asc' | 'desc';
  };
  title?: string;
  className?: string;
  minWidth?: string;
  tableCss?: SerializedStyles;
  cardsCss?: SerializedStyles;
  gridTemplateColumnsCards?: string;
  gridTemplateRowsMobile?: string /* used for mobile view if table has to display more than 1 row */;
  isFetching?: boolean;
}

interface TableCardRowOnClickProps<T extends TableRowProps> extends TableBaseProps<T> {
  rowOnClick?: (e: React.MouseEvent<HTMLDivElement>, row: T) => void;
  getRowHref?: undefined;
}

interface TableCardHrefProps<T extends TableRowProps> extends TableBaseProps<T> {
  rowOnClick?: undefined;
  getRowHref?: (row: T) => string;
}

export type TableProps<T extends TableRowProps> =
  | TableCardRowOnClickProps<T>
  | TableCardHrefProps<T>;

export function Table<T extends TableRowProps>({
  columns,
  cardColumns,
  renderCell,
  data,
  title,
  minWidth,
  initialOrder,
  rowOnClick,
  getRowHref,
  keyExtractor,
  className,
  tableCss,
  cardsCss,
  isFetching,
}: TableProps<T>) {
  const styles = useStyles();

  const [orderBy, setOrderBy] = React.useState<keyof T | undefined>(initialOrder?.orderBy);

  const [orderDirection, setOrderDirection] = React.useState<'asc' | 'desc' | undefined>(
    initialOrder?.orderDirection,
  );

  const onRequestOrder = (property: keyof T) => {
    let newOrder: 'asc' | 'desc' = 'asc';

    if (property === orderBy) {
      newOrder = orderDirection === 'asc' ? 'desc' : 'asc';
    }

    setOrderBy(property);
    setOrderDirection(newOrder);
  };

  const rows = React.useMemo(() => {
    // Return raw data if no order has been set
    if (!orderBy) {
      return data;
    }

    const sortedRows = [...data];

    sortedRows.sort((a, b) => {
      const formattedValueA = Number.isNaN(+a[orderBy].value)
        ? a[orderBy].value
        : +a[orderBy].value;

      const formattedValueB = Number.isNaN(+b[orderBy].value)
        ? b[orderBy].value
        : +b[orderBy].value;

      if (formattedValueA < formattedValueB) {
        return orderDirection === 'asc' ? -1 : 1;
      }

      if (formattedValueA > formattedValueB) {
        return orderDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return sortedRows;
  }, [data, orderBy, orderDirection]);

  return (
    <Paper css={styles.root} className={className}>
      {title && <h4 css={styles.title}>{title}</h4>}

      {isFetching && <Spinner css={styles.loader} />}

      <TableContainer css={tableCss}>
        <TableMUI css={styles.table({ minWidth: minWidth ?? '0' })} aria-label={title}>
          <Head<T>
            columns={columns}
            orderBy={orderBy}
            orderDirection={orderDirection}
            onRequestOrder={onRequestOrder}
          />

          <TableBody>
            {rows.map(row => {
              const rowKey = keyExtractor(row);

              return (
                <TableRow
                  hover
                  key={rowKey}
                  css={styles.getTableRow({ clickable: !!rowOnClick })}
                  onClick={
                    rowOnClick && ((e: React.MouseEvent<HTMLDivElement>) => rowOnClick(e, row))
                  }
                >
                  {columns.map(({ key }) => {
                    const cell = row[key];
                    const cellContent = renderCell({ row, columnKey: key });
                    const cellTitle = typeof cellContent === 'string' ? cellContent : undefined;

                    return (
                      <TableCell
                        css={styles.getCellWrapper({ containsLink: !!getRowHref })}
                        key={`${rowKey}-cell-${String(key)}`}
                        title={cellTitle}
                        align={cell.align}
                      >
                        {getRowHref ? <Link to={getRowHref(row)}>{cellContent}</Link> : cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </TableMUI>
      </TableContainer>

      <TableCards
        rows={rows}
        renderCell={renderCell}
        keyExtractor={keyExtractor}
        rowOnClick={rowOnClick}
        getRowHref={getRowHref}
        columns={cardColumns || columns}
        css={cardsCss}
      />
    </Paper>
  );
}
