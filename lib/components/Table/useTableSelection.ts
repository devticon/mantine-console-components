import { useCallback, useMemo, useState } from 'react';
import { mapObjectToSearchParams } from '../../utils/search-params';

export function useTableSelection<T extends object>(rowId: keyof T, initial?: T[]) {
  const [selectedRows, setSelectedRows] = useState<T[]>(initial || []);
  const resetSelectedRows = useCallback(() => setSelectedRows([]), []);

  const selectedIdsSearchParams = useMemo(() => {
    return mapObjectToSearchParams({
      selectedIds: selectedRows.map(r => r[rowId] as string),
    });
  }, [rowId, selectedRows]);

  return {
    selectedRows,
    setSelectedRows,
    resetSelectedRows,
    selectedIdsSearchParams,
  };
}
