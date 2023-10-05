import type { GroupProps } from '@mantine/core';
import { Group, Pagination, Select } from '@mantine/core';
import { getNsField } from '../../utils/hasura';
import type { BaseFilters } from './utils';

type Props<F extends BaseFilters> = GroupProps & {
  pagination: { count: number };
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

  const handlePageChange = (newPage: number) => {
    handleFiltersChange({
      [pageKey]: newPage,
    } as Partial<F>);
  };

  const handlePerPageChange = (newPerPage: string) => {
    handleFiltersChange?.({
      [pageKey]: 1,
      [perPageKey]: parseInt(newPerPage || '25'),
    } as Partial<F>);
  };

  return (
    <Group justify="space-between" {...props}>
      <Pagination total={Math.ceil(pagination.count / perPage)} withEdges value={page} onChange={handlePageChange} />
      <Select
        value={perPage.toString()}
        data={perPageOptions}
        onChange={handlePerPageChange}
        checkIconPosition="right"
      />
    </Group>
  );
};
