import { useSearchParams } from '@remix-run/react';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import type { BaseFilters } from './utils.ts';
import { mapFiltersToSearchParams } from './utils.ts';

type Params<F extends BaseFilters> = {
  initialFilters: F;
  defaultFilters: F;
};

export function useTableFilters<F extends BaseFilters>({ initialFilters, defaultFilters }: Params<F>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);

  const handleDebouncedSearchParams = useMemo(() => {
    return debounce(setSearchParams, 500);
  }, [setSearchParams]);

  const handleFiltersChange = (partialFilters: Partial<F>, debounce = false) => {
    const newFilters = { ...filters, ...partialFilters };

    if (debounce) {
      setFilters(newFilters);
      handleDebouncedSearchParams(mapFiltersToSearchParams(newFilters));
    } else {
      setFilters(newFilters);
      setSearchParams(mapFiltersToSearchParams(newFilters));
    }
  };

  const handleFiltersReset = () => {
    setFilters(defaultFilters);
    setSearchParams(mapFiltersToSearchParams({}));
  };

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    handleFiltersChange,
    handleFiltersReset,
    searchParams,
  };
}
