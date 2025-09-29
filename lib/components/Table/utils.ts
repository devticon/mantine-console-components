import type { JsonPrimitive } from '../../utils/search-params.js';

export type BaseFilters = Record<string, JsonPrimitive | JsonPrimitive[]>;
export type BaseItem = { id: string | number };
