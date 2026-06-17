import { ActionIcon, Box, Group, Popover, Table, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { cloneElement, isValidElement } from 'react';
import { useTranslation } from 'react-i18next';
import { TbArrowDown, TbArrowUp, TbFilter, TbInfoCircle } from 'react-icons/tb';
import invariant from 'tiny-invariant';
import { getNsField, OrderBy, revertSortDirection } from '../../utils/hasura.js';
import type { Props as TableColumnProps } from './TableColumn.js';
import type { Props as TableFilterProps } from './TableFilter.js';
import { isFilterActive, type BaseFilters, type BaseItem } from './utils.js';

type Props<T extends BaseItem, F extends BaseFilters> = TableColumnProps<T, F> & {
  ns?: string;
  filters?: F;
  handleFiltersChange?: (filters: Partial<F>, debounce?: boolean) => void;
};

export const TableTh = <T extends BaseItem, F extends BaseFilters>({
  ns,
  filters,
  handleFiltersChange,
  dataKey,
  visibleFrom,
  sortable,
  title,
  tooltipLabel,
  filter,
}: Props<T, F>) => {
  if (sortable) {
    invariant(filters, '`filters` is required if column is `sortable`');
    invariant(handleFiltersChange, '`handleFiltersChange` is required if column is `sortable`');
  }

  if (filter) {
    invariant(filters, '`filters` is required if column has `filter`');
    invariant(handleFiltersChange, '`handleFiltersChange` is required if column has `filter`');
  }

  const { t } = useTranslation('mantine-console-components');
  const orderByKey = getNsField('orderBy', ns);
  const orderDirKey = getNsField('orderDir', ns);
  const isSorted = filters?.[orderByKey] === dataKey;
  const SortIcon = isSorted && filters?.[orderDirKey] === OrderBy.Desc ? TbArrowUp : TbArrowDown;
  const filterProps = isValidElement(filter) ? (filter.props as TableFilterProps<F>) : null;
  const hasActiveFilter = filterProps && filters ? isFilterActive(filterProps, filters) : false;
  const debounce = filterProps ? ['range', 'text'].includes(filterProps.type) : false;

  const handleToggleSort = () => {
    handleFiltersChange?.({
      [orderByKey]: dataKey,
      [orderDirKey]: isSorted ? revertSortDirection(filters?.[orderDirKey]) : OrderBy.Asc,
    } as Partial<F>);
  };

  const filterElement =
    isValidElement(filter) && filters
      ? cloneElement(filter, {
          alwaysOn: undefined,
          Icon: undefined,
          value: filters,
          onChange: (value: Partial<F>) => handleFiltersChange?.(value, debounce),
        })
      : null;

  return (
    <Table.Th visibleFrom={visibleFrom}>
      <Group gap="xs" wrap="nowrap">
        <Box fw={500} style={{ whiteSpace: 'nowrap' }}>
          {title}
        </Box>
        {sortable && (
          <ActionIcon variant={isSorted ? 'filled' : 'subtle'} size="xs" aria-label={t('Table.sortColumn')}>
            <SortIcon size="0.875rem" onClick={handleToggleSort} />
          </ActionIcon>
        )}
        {filterElement && (
          <Popover position="bottom-start" withArrow shadow="md">
            <Popover.Target>
              <ActionIcon
                variant={hasActiveFilter ? 'filled' : 'subtle'}
                size="xs"
                aria-label={t('Table.filterColumn')}
              >
                <TbFilter size="0.875rem" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown p="sm" miw={200}>
              {filterElement}
            </Popover.Dropdown>
          </Popover>
        )}
        {tooltipLabel && (
          <Tooltip label={tooltipLabel} withArrow maw={160} multiline>
            <ActionIcon variant="subtle" size="xs">
              <TbInfoCircle size="0.875rem" />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Table.Th>
  );
};
