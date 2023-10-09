import type { TableProps } from '@mantine/core';
import { Checkbox, Table as MantineTable, Text } from '@mantine/core';
import differenceBy from 'lodash/differenceBy';
import unionBy from 'lodash/unionBy';
import xorBy from 'lodash/xorBy';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { Children } from 'react';
import { useTranslation } from 'react-i18next';
import type { Props as TableColumnProps } from './TableColumn';
import { TablePagination } from './TablePagination';
import { TableTd } from './TableTd';
import { TableTh } from './TableTh';
import { TableWrapper } from './TableWrapper';
import type { BaseFilters, BaseItem } from './utils';

type Props<T extends BaseItem, F extends BaseFilters> = TableProps & {
  children: ReactElement<TableColumnProps<T>>[];
  data: T[];
  loading?: boolean;
  pagination: { count: number; type?: 'default' | 'optimized' };
  ns?: string;
  filters?: F;
  handleFiltersChange?: (filters: Partial<F>) => void;
  selection?: { selectedRows: T[]; setSelectedRows: Dispatch<SetStateAction<T[]>> };
};

export const Table = <T extends BaseItem, F extends BaseFilters>({
  children,
  data,
  loading,
  pagination,
  ns,
  filters,
  handleFiltersChange,
  selection,
  ...props
}: Props<T, F>) => {
  const { t } = useTranslation('mantine-console-components');
  const allItemsChecked = data.every(item => selection?.selectedRows.find(i => i.id === item.id));
  const someItemsChecked = data.some(item => selection?.selectedRows.find(i => i.id === item.id));

  const handleToggleAll = () => {
    if (allItemsChecked) {
      selection?.setSelectedRows(current => differenceBy(current, data, 'id'));
    } else {
      selection?.setSelectedRows(current => unionBy(current, data, 'id'));
    }
  };

  const handleToggleRow = (item: T) => {
    selection?.setSelectedRows(current => xorBy(current, [item], 'id'));
  };

  return (
    <>
      <TableWrapper loading={loading}>
        <MantineTable
          w="100%"
          verticalSpacing="md"
          horizontalSpacing="md"
          {...props}
          highlightOnHover={props.highlightOnHover && data.length > 0}
        >
          <MantineTable.Thead>
            <MantineTable.Tr>
              {selection && data.length > 0 && (
                <MantineTable.Th w={52}>
                  <Checkbox
                    aria-label={t('Table.selectAllRows')}
                    indeterminate={someItemsChecked && !allItemsChecked}
                    checked={allItemsChecked}
                    onChange={handleToggleAll}
                  />
                </MantineTable.Th>
              )}
              {Children.map(children, ({ props }) => (
                <TableTh filters={filters} handleFiltersChange={handleFiltersChange} ns={ns} {...props} />
              ))}
            </MantineTable.Tr>
          </MantineTable.Thead>

          <MantineTable.Tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <MantineTable.Tr key={item.id}>
                  {selection && (
                    <MantineTable.Td>
                      <Checkbox
                        aria-label={t('Table.selectRow')}
                        checked={selection.selectedRows.some(r => r.id === item.id)}
                        onChange={() => handleToggleRow(item)}
                      />
                    </MantineTable.Td>
                  )}
                  {Children.map(children, ({ props }) => (
                    <TableTd item={item} index={index} {...props} />
                  ))}
                </MantineTable.Tr>
              ))
            ) : (
              <MantineTable.Tr>
                <MantineTable.Td colSpan={Children.count(children)}>
                  <Text>{t('Table.empty')}</Text>
                </MantineTable.Td>
              </MantineTable.Tr>
            )}
          </MantineTable.Tbody>
        </MantineTable>
      </TableWrapper>

      {pagination && filters && handleFiltersChange && (
        <TablePagination
          mt="sm"
          ns={ns}
          pagination={pagination}
          filters={filters}
          handleFiltersChange={handleFiltersChange}
        />
      )}
    </>
  );
};
