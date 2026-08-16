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
    <tr className={`border-b border-stone-100 transition-colors ${isSelected ? 'bg-amber-50/60' : 'hover:bg-stone-50/50'}`}>
      {selectable && (
        <td className="p-3 w-10 sticky left-0 z-5 bg-white">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggleSelection && onToggleSelection(id)}
            className="w-4 h-4 rounded-md border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            aria-label={`Select row ${String(id)}`}
          />
        </td>
      )}
      {columns.map((col) => (
        <td key={col.key as string} className="p-3.5 text-xs text-stone-700 font-medium">
          {col.render ? col.render(item) : String((item as any)[col.key] || '')}
        </td>
      ))}
    </tr>
  );
}) as <T extends any>(props: { item: T; columns: Column<T>[]; id: string; isSelected: boolean; selectable: boolean; onToggleSelection?: (id: string) => void; key?: React.Key }) => React.JSX.Element;

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
    <div className="relative overflow-x-auto rounded-2xl border border-stone-200 shadow-2xs bg-white font-['Mukta']">
      <table className="w-full text-left border-collapse">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            {selectable && (
              <th className="p-3 w-10 sticky left-0 z-10 bg-stone-50">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  ref={input => { if (input) input.indeterminate = someSelected; }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded-md border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key as string}
                className={`p-3.5 text-xs font-bold text-stone-700 tracking-wide ${col.sortable ? "cursor-pointer select-none hover:text-stone-900" : "select-none"}`}
                onClick={() => col.sortable && handleSort(col.key as string)}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="text-stone-400">
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-600" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5" />
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
};

export const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent;
