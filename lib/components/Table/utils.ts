import type { JsonPrimitive } from '../../utils/search-params.js';
import { isEqualWith } from 'lodash-es';

export type BaseFilters = Record<string, JsonPrimitive | JsonPrimitive[]>;
export type BaseItem = { id: string | number };

export function areFiltersEqual(a: BaseFilters, b: BaseFilters) {
  const isEmptyValue = (val: unknown) => {
    return val === null || val === undefined || val === '';
  };

  return isEqualWith(a, b, (objValue, othValue) => {
    if (isEmptyValue(objValue) && isEmptyValue(othValue)) {
      return true;
    }
  });
}
