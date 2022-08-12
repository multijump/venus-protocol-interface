/** @jsxImportSource @emotion/react */
import { Paper, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { Delimiter } from '../Delimiter';
import { useStyles } from './styles';
import { TableColumnProps, TableRowProps } from './types';

export interface TableCardsProps<T extends TableRowProps> {
  rows: T[];
  keyExtractor: (row: T) => string;
  columns: TableColumnProps<T>[];
  renderCell: ({
    row,
    columnKey,
  }: {
    row: T;
    columnKey: TableColumnProps<T>['key'];
  }) => React.ReactNode | string;
  className?: string;
  rowOnClick?: (e: React.MouseEvent<HTMLDivElement>, row: T) => void;
  getRowHref?: (row: T) => string;
}

export function TableCards<T extends TableRowProps>({
  rows,
  keyExtractor,
  columns,
  renderCell,
  rowOnClick,
  getRowHref,
  className,
}: TableCardsProps<T>) {
  const styles = useStyles();

  return (
    <div className={className}>
      {rows.map(row => {
        const rowKey = keyExtractor(row);
        const [titleColumn, ...otherColumns] = columns;

        return (
          <Paper
            key={`table-card-row-${rowKey}`}
            css={styles.tableWrapperMobile({ clickable: !!(rowOnClick || getRowHref) })}
            onClick={rowOnClick && ((e: React.MouseEvent<HTMLDivElement>) => rowOnClick(e, row))}
            component={
              getRowHref
                ? ({ children, ...props }) => (
                    <div {...props}>
                      <Link to={getRowHref(row)}>{children}</Link>
                    </div>
                  )
                : 'div'
            }
          >
            <div css={styles.rowTitleMobile}>{renderCell({ row, columnKey: titleColumn.key })}</div>

            <Delimiter css={styles.delimiterMobile} />

            <div className="table__table-cards__card-content" css={styles.rowWrapperMobile}>
              {otherColumns.map(column => {
                const cellContent = renderCell({ row, columnKey: column.key });

                return (
                  <div
                    key={`table-card-cell-${rowKey}-${String(column.key)}`}
                    css={styles.cellMobile}
                  >
                    <Typography variant="body2" css={styles.columnLabelMobile}>
                      {column?.label}
                    </Typography>

                    <div css={styles.cellValueMobile}>{cellContent}</div>
                  </div>
                );
              })}
            </div>
          </Paper>
        );
      })}
    </div>
  );
}

export default TableCards;
