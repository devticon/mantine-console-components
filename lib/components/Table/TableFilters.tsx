import { Button, Drawer, Group, SimpleGrid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import { useTranslation } from 'react-i18next';
import { TbFilter, TbFilterX } from 'react-icons/tb';
import type { Props as TableFilterProps } from './TableFilter';
import type { BaseFilters } from './utils';

type Child<F extends BaseFilters> = ReactElement<TableFilterProps<F>> | false;

type Props<F extends BaseFilters> = {
  children: Child<F> | Child<F>[];
  filters: F;
  handleFiltersChange: (filters: Partial<F>, debounce?: boolean) => void;
  handleFiltersReset?: () => void;
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

  const hasDrawerFilters = Children.map(children, child => {
    return isValidElement(child) && !child.props.alwaysOn;
  }).some(Boolean);

  const handleChild = (child: Child<F>, isAlwaysOn: boolean) => {
    if (!isValidElement(child)) {
      return null;
    }

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
            <Button onClick={open} rightSection={<TbFilter size={20} />}>
              {t('Table.openFiltersButton')}
            </Button>
          )}
          {handleFiltersReset && (
            <Button onClick={handleFiltersReset} color="red" rightSection={<TbFilterX size={20} />}>
              {t('Table.resetFiltersButton')}
            </Button>
          )}
          {actions}
        </Group>
      </Group>
    </>
  );
};
