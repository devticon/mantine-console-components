import type { TableTdProps } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import type { Props as TableFilterProps } from './TableFilter.js';
import type { BaseFilters } from './utils.js';

export type Props<T, F extends BaseFilters = BaseFilters> = Omit<TableTdProps, 'title'> & {
  title?: string;
  dataKey: string;
  sortable?: boolean;
  tooltipLabel?: string;
  sticky?: boolean;
  render?: (item: T, index: number) => ReactNode;
  filter?: ReactElement<TableFilterProps<F>>;
};

export const TableColumn = <T, F extends BaseFilters = BaseFilters>(props: Props<T, F>) => {
  return null;
};
