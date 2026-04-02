import type { JsonPrimitive } from '../../utils/search-params.js';
import { isEmpty, isEqual, keys, union } from 'lodash-es';

export type BaseFilters = Record<string, JsonPrimitive | JsonPrimitive[]>;
export type BaseItem = { id: string | number };

export function areFiltersEqual(a: BaseFilters, b: BaseFilters) {
  const allKeys = union(keys(a), keys(b));

  return allKeys.every(key => {
    const val1 = a[key];
    const val2 = b[key];

    if (isEmpty(val1) && isEmpty(val2)) {
      return true;
    } else {
      return isEqual(val1, val2);
    }
  });
}
