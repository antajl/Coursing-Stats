export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export function handleSortToggle(currentField: string, currentSort: SortState): SortState {
  if (currentSort.field === currentField) {
    return {
      field: currentField,
      direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
    };
  } else {
    return {
      field: currentField,
      direction: 'desc'
    };
  }
}

export function sortArray<T>(
  array: T[],
  sortField: string,
  sortDirection: 'asc' | 'desc',
  isStringField?: boolean
): T[] {
  return [...array].sort((a, b) => {
    let aVal = (a as any)[sortField];
    let bVal = (b as any)[sortField];

    if (aVal === null || aVal === undefined) aVal = 0;
    if (bVal === null || bVal === undefined) bVal = 0;

    if (isStringField) {
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    } else {
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    }
  });
}
