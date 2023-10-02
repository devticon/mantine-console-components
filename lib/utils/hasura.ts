import type { BaseFilters } from '../components/Table/utils';

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

export function getBaseVariables(filters: BaseFilters, ns?: string) {
  const orderBy = filters[getNsField('orderBy', ns)];
  const orderDir = filters[getNsField('orderDir', ns)];
  const limit = filters[getNsField('perPage', ns)];
  const page = filters[getNsField('page', ns)];
  const perPage = filters[getNsField('perPage', ns)];

  const where: {
    offset?: number;
    limit?: number;
    orderBy?: { [name: string]: OrderBy };
  } = {};

  if (typeof orderBy === 'string' && typeof orderDir === 'string') {
    where.orderBy = { [orderBy]: orderDir as OrderBy };
  }

  if (typeof limit === 'number') {
    where.limit = limit;
  }

  if (typeof page === 'number' && typeof perPage === 'number') {
    where.offset = (page - 1) * perPage;
  }

  return where;
}
