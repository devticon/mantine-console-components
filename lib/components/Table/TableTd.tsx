import { Table } from '@mantine/core';
import get from 'lodash/get';
import type { Props as TableColumnProps } from './TableColumn';
import type { BaseItem } from './utils';

type Props<T extends BaseItem> = TableColumnProps<T> & {
  item: T;
  index: number;
};

export const TableTd = <T extends BaseItem>({ item, index, sortable, render, dataKey, ...props }: Props<T>) => {
  return <Table.Td {...props}>{render ? render(item, index) : get(item, dataKey)}</Table.Td>;
};
