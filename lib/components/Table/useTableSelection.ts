import { useCallback, useState } from 'react';

export function useTableSelection<T extends object>(rowId: keyof T, initial?: T[]) {
  const [selectedRows, setSelectedRows] = useState<T[]>(initial || []);
  const resetSelectedRows = useCallback(() => setSelectedRows([]), []);

  return {
    selectedRows,
    setSelectedRows,
    resetSelectedRows,
  };
}
