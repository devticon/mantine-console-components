import { Table } from '@mantine/core';
import get from 'lodash/get';
import type { Props as TableColumnProps } from './TableColumn.tsx';
import type { BaseItem } from './utils';

type Props<T extends BaseItem> = TableColumnProps<T> & {
  item: T;
  index: number;
};

export const TableTd = <T extends BaseItem>({ item, index, ...props }: Props<T>) => {
  return <Table.Td {...props}>{props.render ? props.render(item, index) : get(item, props.dataKey)}</Table.Td>;
};
