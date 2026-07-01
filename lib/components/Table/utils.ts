import type { JsonPrimitive } from '../../utils/search-params.js';
import { isArray, isEmpty, isEqual, isNil, keys, union } from 'lodash-es';
import type { Props as TableFilterProps } from './TableFilter.js';

export type BaseFilters = Record<string, JsonPrimitive | JsonPrimitive[]>;
export type BaseItem = { id: string | number };

export function isFilterActive<F extends BaseFilters>(filter: Pick<TableFilterProps<F>, 'name' | 'type'>, filters: F) {
  const { name, type } = filter;

  if (type === 'date-range' || type === 'range') {
    return !isEmpty(filters[`${name}From` as keyof F]) || !isEmpty(filters[`${name}To` as keyof F]);
  }

  if (type === 'multi-select') {
    const value = filters[name as keyof F];
    return Array.isArray(value) && value.length > 0;
  }

  if (type === 'switch') {
    return filters[name as keyof F] === true;
  }

  if (type === 'custom') {
    return false;
  }

  return !isEmpty(filters[name as keyof F]);
}

export function areFiltersEqual(a: BaseFilters, b: BaseFilters) {
  const allKeys = union(keys(a), keys(b));

  return allKeys.every(key => {
    const val1 = a[key];
    const val2 = b[key];

    if (isNil(val1) && isNil(val2)) {
      return true;
    } else if (isArray(val1) && isEmpty(val1) && isArray(val2) && isEmpty(val2)) {
      return true;
    } else {
      return isEqual(val1, val2);
    }
  });
}
