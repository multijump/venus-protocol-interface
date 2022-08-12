export interface TableCellProps {
  value: string | number | boolean;
  align?: 'left' | 'center' | 'right';
}

export type TableRowProps = Record<string | number, TableCellProps>;

export interface TableColumnProps<T extends TableRowProps> {
  key: keyof T;
  label: string;
  orderable: boolean;
  align?: 'left' | 'center' | 'right';
}
