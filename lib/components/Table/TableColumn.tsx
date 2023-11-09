import type { TableTdProps } from '@mantine/core';
import type { ReactNode } from 'react';

export type Props<T> = Omit<TableTdProps, 'title'> & {
  title?: string;
  dataKey: string;
  sortable?: boolean;
  tooltipLabel?: string;
  render?: (item: T, index: number) => ReactNode;
};

export const TableColumn = <T,>(props: Props<T>) => {
  return null;
};
