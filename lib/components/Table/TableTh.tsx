import { ActionIcon, Box, Group, Table, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbArrowDown, TbArrowUp, TbInfoCircle } from 'react-icons/tb';
import invariant from 'tiny-invariant';
import { getNsField, OrderBy, revertSortDirection } from '../../utils/hasura';
import type { Props as TableColumnProps } from './TableColumn';
import type { BaseFilters, BaseItem } from './utils';

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
  tooltipLabel,
}: Props<T, F>) => {
  if (sortable) {
    invariant(filters, '`filters` is required if column is `sortable`');
    invariant(handleFiltersChange, '`handleFiltersChange` is required if column is `sortable`');
  }

  const { t } = useTranslation('mantine-console-components');
  const orderByKey = getNsField('orderBy', ns);
  const orderDirKey = getNsField('orderDir', ns);
  const isSorted = filters?.[orderByKey] === dataKey;
  const SortIcon = isSorted && filters?.[orderDirKey] === OrderBy.Desc ? TbArrowUp : TbArrowDown;

  const handleToggleSort = () => {
    handleFiltersChange?.({
      [orderByKey]: dataKey,
      [orderDirKey]: isSorted ? revertSortDirection(filters?.[orderDirKey]) : OrderBy.Asc,
    } as Partial<F>);
  };

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
