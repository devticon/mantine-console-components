import { ActionIcon, Button, Drawer, Group, SimpleGrid, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement, isValidElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbFilter, TbFilterX } from 'react-icons/tb';
import type { Props as TableFilterProps } from './TableFilter';
import type { BaseFilters } from './utils';
import { isEqual } from 'lodash-es';

type Child<F extends BaseFilters> = ReactElement<TableFilterProps<F>> | false;

type Props<F extends BaseFilters> = {
  children: Child<F> | Child<F>[];
  filters: F;
  defaultFilters?: F;
  handleFiltersChange: (filters: Partial<F>, debounce?: boolean) => void;
  handleFiltersReset?: () => void;
  actions?: ReactNode;
  openFiltersButtonLabel?: string;
  saveFiltersButtonLabel?: string;
};

export const TableFilters = <F extends BaseFilters>({
  children,
  filters,
  defaultFilters,
  handleFiltersChange,
  handleFiltersReset,
  actions,
  saveFiltersButtonLabel,
  openFiltersButtonLabel,
}: Props<F>) => {
  const { t } = useTranslation('mantine-console-components');
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const [drawerFilters, setDrawerFilters] = useState<F>(filters);
  const areSame = defaultFilters && isEqual(filters, defaultFilters);

  const hasDrawerFilters = Children.map(children, child => {
    return isValidElement(child) && (!child.props.alwaysOn || !isDesktop);
  }).some(Boolean);

  const openDrawer = () => {
    setDrawerFilters(filters);
    open();
  };

  const closeDrawer = () => {
    close();
  };

  const saveDrawer = () => {
    handleFiltersChange(drawerFilters);
    close();
  };

  const handleChild = (child: Child<F>, isAlwaysOn: boolean) => {
    if (!isValidElement(child)) {
      return null;
    }

    const debounce = ['range', 'text'].includes(child.props.type);

    const element = cloneElement(child, {
      alwaysOn: undefined,
      Icon: undefined,
      value: isAlwaysOn ? filters : drawerFilters,
      onChange: (value: Partial<F>) =>
        isAlwaysOn ? handleFiltersChange(value, debounce) : setDrawerFilters(c => ({ ...c, ...value })),
      variant: child.props.alwaysOn ? 'default' : 'filled',
    });

    if (isAlwaysOn) {
      // display on page
      return isDesktop && child.props.alwaysOn ? element : null;
    } else {
      // display in drawer
      return !isDesktop || !child.props.alwaysOn ? element : null;
    }
  };

  return (
    <>
      <Drawer opened={opened} onClose={isDesktop ? saveDrawer : closeDrawer} title={t('Table.filtersTitle')}>
        <SimpleGrid cols={1} spacing="lg">
          {Children.map(children, child => handleChild(child, false))}
          <Button hiddenFrom="md" onClick={saveDrawer} rightSection={<TbFilter size={20} />} fullWidth mt="auto">
            {saveFiltersButtonLabel || t('Table.saveFiltersButton')}
          </Button>
        </SimpleGrid>
      </Drawer>

      <Group justify="space-between" align="flex-end" mb="md">
        <Group gap="sm" wrap="nowrap">
          {Children.map(children, child => handleChild(child, true))}
        </Group>
        <Group gap="sm">
          {hasDrawerFilters && (
            <>
              <Button visibleFrom="md" onClick={openDrawer} rightSection={<TbFilter size={20} />}>
                {openFiltersButtonLabel || t('Table.openFiltersButton')}
              </Button>
              <ActionIcon hiddenFrom="md" size="lg" onClick={openDrawer} aria-label={t('Table.openFiltersButton')}>
                <TbFilter size={20} />
              </ActionIcon>
            </>
          )}
          {handleFiltersReset && !areSame && (
            <>
              <Button visibleFrom="md" onClick={handleFiltersReset} color="red" rightSection={<TbFilterX size={20} />}>
                {t('Table.resetFiltersButton')}
              </Button>
              <ActionIcon
                hiddenFrom="md"
                size="lg"
                onClick={handleFiltersReset}
                color="red"
                aria-label={t('Table.resetFiltersButton')}
              >
                <TbFilterX size={20} />
              </ActionIcon>
            </>
          )}
          {actions}
        </Group>
      </Group>
    </>
  );
};
