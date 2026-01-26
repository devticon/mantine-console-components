import { Table } from '@mantine/core';
import { get } from 'lodash-es';
import type { Props as TableColumnProps } from './TableColumn.js';
import type { BaseItem } from './utils.js';

type Props<T extends BaseItem> = TableColumnProps<T> & {
  item: T;
  index: number;
};

export const TableTd = <T extends BaseItem>({ item, index, sortable, render, dataKey, sticky, ...props }: Props<T>) => {
  const isSticky = sticky || dataKey === 'actions';

  return (
    <Table.Td
      style={
        isSticky
          ? { position: 'sticky', right: 0, zIndex: 3, backgroundColor: 'var(--mantine-color-body)', ...props.style }
          : props.style
      }
      {...props}
    >
      {render ? render(item, index) : get(item, dataKey)}
    </Table.Td>
  );
};
