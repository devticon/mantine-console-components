import { ActionIcon, Box, Group, Table } from '@mantine/core';
import { IoArrowDown, IoArrowUp } from 'react-icons/io5';
import invariant from 'tiny-invariant';
import type { Props as TableColumnProps } from './TableColumn.tsx';
import { BaseFilters, BaseItem, getNsField, OrderBy, revertSortDirection } from './utils.ts';

type Props<T extends BaseItem, F extends BaseFilters> = TableColumnProps<T> & {
  ns?: string;
  filters?: F;
  handleFiltersChange?: (filters: Partial<F>) => void;
};

export const TableTh = <T extends BaseItem, F extends BaseFilters>({
  ns,
  filters,
  handleFiltersChange,
  dataKey,
  visibleFrom,
  sortable,
  title,
}: Props<T, F>) => {
  if (sortable) {
    invariant(filters, '`filters` is required if column is `sortable`');
    invariant(handleFiltersChange, '`handleFiltersChange` is required if column is `sortable`');
  }

  const orderByKey = getNsField('orderBy', ns);
  const orderDirKey = getNsField('orderDir', ns);
  const isSorted = filters?.[orderByKey] === dataKey;
  const SortIcon = isSorted && filters?.[orderDirKey] === OrderBy.Desc ? IoArrowUp : IoArrowDown;

  const handleToggleSort = () => {
    handleFiltersChange?.({
      [orderByKey]: dataKey,
      [orderDirKey]: isSorted ? revertSortDirection(filters?.[orderDirKey]) : OrderBy.Asc,
    } as Partial<F>);
  };

  return (
    <Table.Th visibleFrom={visibleFrom} bg="gray.0">
      <Group gap="xs" wrap="nowrap">
        <Box fw={500} style={{ whiteSpace: 'nowrap' }}>
          {title}
        </Box>
        {sortable && (
          <ActionIcon variant={isSorted ? 'filled' : 'subtle'} size="xs" aria-label="Change the sorting order">
            <SortIcon size="0.875rem" onClick={handleToggleSort} />
          </ActionIcon>
        )}
      </Group>
    </Table.Th>
  );
};
