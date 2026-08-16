import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  // Multi-select props
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onClearSelection?: () => void;
}

const DataTableRow = React.memo(<T extends any>({ 
  item, 
  columns, 
  id, 
  isSelected, 
  selectable, 
  onToggleSelection 
}: {
  item: T;
  columns: Column<T>[];
  id: string;
  isSelected: boolean;
  selectable: boolean;
  onToggleSelection?: (id: string) => void;
}) => {
  return (
    <tr className={isSelected ? 'bg-surface-hover' : ''}>
      {selectable && (
        <td className={`sticky left-0 z-5 ${isSelected ? 'bg-surface-hover' : 'bg-surface'}`} style={{ width: '40px' }}>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggleSelection && onToggleSelection(id)}
            className="cursor-pointer"
            aria-label={`Select row ${String(id)}`}
          />
        </td>
      )}
      {columns.map((col) => (
        <td key={col.key as string}>
          {col.render ? col.render(item) : String((item as any)[col.key] || '')}
        </td>
      ))}
    </tr>
  );
}) as <T extends any>(props: { item: T; columns: Column<T>[]; id: string; isSelected: boolean; selectable: boolean; onToggleSelection?: (id: string) => void }) => React.JSX.Element;

const DataTableComponent = <T extends any>({ 
  data, 
  columns, 
  keyExtractor, 
  onSort,
  selectable = false,
  selectedIds = [],
  onToggleSelection,
  onSelectAll,
  onClearSelection
}: DataTableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = React.useCallback((key: string) => {
    setSortKey(prevKey => {
      const newDirection = prevKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      if (onSort) onSort(key, newDirection);
      return key;
    });
  }, [sortDirection, onSort]);

  // If no external onSort is provided, we sort locally
  const sortedData = React.useMemo(() => {
    if (onSort || !sortKey) return data;
    
    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, onSort]);

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (onSelectAll) {
        onSelectAll(data.map(keyExtractor));
      }
    } else {
      if (onClearSelection) {
        onClearSelection();
      }
    }
  }, [data, keyExtractor, onSelectAll, onClearSelection]);

  return (
    <div className="table-container relative overflow-x-auto overflow-y-auto" style={{ maxHeight: '100%' }}>
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr>
            {selectable && (
              <th className="sticky left-0 z-11 bg-background" style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  ref={input => { if (input) input.indeterminate = someSelected; }}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                  aria-label="Select all rows"
                />
              </th>
            )}
{columns.map((col) => (
              <th
                key={col.key as string}
                className={col.sortable ? "cursor-pointer select-none" : "select-none"}
                onClick={() => col.sortable && handleSort(col.key as string)}
                aria-sort={col.sortable
                  ? sortKey === col.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined}
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable && (
                    <span className="text-muted">
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : (
                        <ArrowUpDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => {
            const id = keyExtractor(item);
            const isSelected = selectedIds.includes(id);
            return (
              <DataTableRow 
                key={id}
                item={item}
                columns={columns}
                id={id}
                isSelected={isSelected}
                selectable={selectable}
                onToggleSelection={onToggleSelection}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent;
