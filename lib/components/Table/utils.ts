export type BaseItem = {
  id: string | number;
};

export type JsonPrimitive = string | number | boolean | null;
export type BaseFilters = Record<string, JsonPrimitive | JsonPrimitive[]>;

export enum OrderBy {
  Asc = 'asc',
  Desc = 'desc',
}

export function getNsField(field: string, ns?: string) {
  if (ns) {
    return `${ns}${field.charAt(0).toUpperCase() + field.slice(1)}`;
  } else {
    return field;
  }
}

export function revertSortDirection(dir: unknown) {
  return dir === OrderBy.Asc ? OrderBy.Desc : OrderBy.Asc;
}

export function mapValueToString(value: JsonPrimitive): string {
  if (value === null) {
    return '';
  }

  if (typeof value === 'number') {
    return `${value}`;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return value;
}

export function mapFiltersToSearchParams<F extends BaseFilters>(filters: F): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        params.append(key, mapValueToString(v));
      });
    } else {
      params.set(key, mapValueToString(value));
    }
  });

  return params;
}
