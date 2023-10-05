import { Button, Drawer, Group, SimpleGrid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md';
import type { Props as TableFilterProps } from './TableFilter';
import type { BaseFilters } from './utils';

type Props<F extends BaseFilters> = {
  children: ReactElement<TableFilterProps<F>>[] | ReactElement<TableFilterProps<F>>;
  filters: F;
  handleFiltersChange: (filters: Partial<F>, debounce?: boolean) => void;
  handleFiltersReset: () => void;
  actions?: ReactNode;
};

export const TableFilters = <F extends BaseFilters>({
  children,
  filters,
  handleFiltersChange,
  handleFiltersReset,
  actions,
}: Props<F>) => {
  const { t } = useTranslation('mantine-console-components');
  const [opened, { open, close }] = useDisclosure(false);
  const hasDrawerFilters = Children.map(children, child => !child.props.alwaysOn).some(Boolean);

  const handleChild = (child: ReactElement<TableFilterProps<F>>, isAlwaysOn: boolean) => {
    const debounce = ['range', 'text'].includes(child.props.type);

    const element = cloneElement(child, {
      alwaysOn: undefined,
      Icon: undefined,
      value: filters,
      onChange: (value: Partial<F>) => handleFiltersChange(value, debounce),
      variant: child.props.alwaysOn ? 'default' : 'filled',
    });

    if (isAlwaysOn && child.props.alwaysOn) {
      return element;
    } else if (!isAlwaysOn && !child.props.alwaysOn) {
      return element;
    } else {
      return null;
    }
  };

  return (
    <>
      <Drawer opened={opened} onClose={close} title={t('Table.filtersTitle')}>
        <SimpleGrid cols={1} spacing="lg">
          {Children.map(children, child => handleChild(child, false))}
        </SimpleGrid>
      </Drawer>

      <Group justify="space-between" align="flex-end" mb="md">
        <Group gap="sm" wrap="nowrap">
          {Children.map(children, child => handleChild(child, true))}
        </Group>
        <Group gap="sm">
          {hasDrawerFilters && (
            <Button onClick={open} rightSection={<MdFilterAlt size={20} />}>
              {t('Table.openFiltersButton')}
            </Button>
          )}
          <Button onClick={handleFiltersReset} color="red" rightSection={<MdFilterAltOff size={20} />}>
            {t('Table.resetFiltersButton')}
          </Button>
          {actions}
        </Group>
      </Group>
    </>
  );
};
