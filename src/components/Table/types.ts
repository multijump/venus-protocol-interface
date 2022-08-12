export type TableAlign = 'left' | 'center' | 'right';

export interface TableCellProps {
  value: string | number | boolean;
  align?: TableAlign;
}

export type TableRowProps = Record<string | number, TableCellProps>;

export interface TableColumnProps<T extends TableRowProps> {
  key: keyof T;
  label: string;
  orderable: boolean;
  align?: TableAlign;
}
