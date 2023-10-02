import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { BaseFilters, mapFiltersToSearchParams } from './utils.ts';

type Params<F extends BaseFilters> = {
  initialFilters: F;
  defaultFilters: F;
  handleSearchParams: (params: URLSearchParams) => void;
};

export function useTableFilters<F extends BaseFilters>({
  initialFilters,
  defaultFilters,
  handleSearchParams,
}: Params<F>) {
  const [filters, setFilters] = useState(initialFilters);

  const handleDebouncedSearchParams = useMemo(() => {
    return debounce(handleSearchParams, 500);
  }, [handleSearchParams]);

  const handleFiltersChange = (partialFilters: Partial<F>, debounce = false) => {
    const newFilters = { ...filters, ...partialFilters };

    if (debounce) {
      setFilters(newFilters);
      handleDebouncedSearchParams(mapFiltersToSearchParams(newFilters));
    } else {
      setFilters(newFilters);
      handleSearchParams(mapFiltersToSearchParams(newFilters));
    }
  };

  const handleFiltersReset = () => {
    setFilters(defaultFilters);
    handleSearchParams(mapFiltersToSearchParams({}));
  };

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    handleFiltersChange,
    handleFiltersReset,
  };
}
