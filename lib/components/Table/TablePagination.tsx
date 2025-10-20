import type { GroupProps } from '@mantine/core';
import { Group, Pagination, Select } from '@mantine/core';
import { useMemo } from 'react';
import { getNsField } from '../../utils/hasura.js';
import type { BaseFilters } from './utils.js';

type Props<F extends BaseFilters> = GroupProps & {
  pagination: { count: number; type?: 'default' | 'optimized' };
  ns?: string;
  filters: F;
  handleFiltersChange: (filters: Partial<F>) => void;
};

export const TablePagination = <F extends BaseFilters>({
  pagination,
  ns,
  filters,
  handleFiltersChange,
  ...props
}: Props<F>) => {
  const perPageKey = getNsField('perPage', ns);
  const pageKey = getNsField('page', ns);
  const page = (filters[pageKey] as number) || 1;
  const perPage = (filters[perPageKey] as number) || 25;
  const perPageOptions = ['10', '25', '50', '100'];

  const totalPages = useMemo(() => {
    if (pagination.type === 'optimized') {
      return pagination.count >= perPage ? page + 1 : page;
    } else {
      return Math.ceil(pagination.count / perPage);
    }
  }, [page, pagination.count, pagination.type, perPage]);

  const handlePageChange = (newPage: number) => {
    handleFiltersChange({
      [pageKey]: newPage,
    } as Partial<F>);
  };

  const handlePerPageChange = (newPerPage: string | null) => {
    handleFiltersChange?.({
      [pageKey]: 1,
      [perPageKey]: parseInt(newPerPage || '25'),
    } as Partial<F>);
  };

  return (
    <Group justify="space-between" {...props}>
      <Pagination
        total={totalPages}
        withEdges={pagination.type === 'default'}
        value={page}
        onChange={handlePageChange}
      />
      <Select
        value={perPage.toString()}
        data={perPageOptions}
        onChange={handlePerPageChange}
        checkIconPosition="right"
      />
    </Group>
  );
};
