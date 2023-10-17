import type { ComboboxData } from '@mantine/core';
import type { TFunction } from 'i18next';

export function mapEnumToComboboxData(enumObject: object, key: string, t: TFunction): ComboboxData {
  return Object.values(enumObject).map(value => ({ value, label: t(`${key}.${value}`) }));
}
