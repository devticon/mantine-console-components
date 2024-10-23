import { useSearchParams } from '@remix-run/react';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { mapObjectToSearchParams } from '../../utils/search-params';
import type { BaseFilters } from './utils';

type Params<F extends BaseFilters> = {
  initialFilters: F;
  defaultFilters: F;
};

export function useTableFilters<F extends BaseFilters>({ initialFilters, defaultFilters }: Params<F>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);

  const handleDebouncedSearchParams = useMemo(() => {
    return debounce(setSearchParams, 1000);
  }, [setSearchParams]);

  const handleFiltersChange = (partialFilters: Partial<F>, debounce = false) => {
    const newFilters = { ...filters, ...partialFilters };

    if (debounce) {
      setFilters(newFilters);
      handleDebouncedSearchParams(mapObjectToSearchParams(newFilters));
    } else {
      setFilters(newFilters);
      setSearchParams(mapObjectToSearchParams(newFilters));
    }
  };

  const handleFiltersReset = () => {
    setFilters(defaultFilters);
    setSearchParams(mapObjectToSearchParams(defaultFilters));
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
