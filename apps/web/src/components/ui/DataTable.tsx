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
  emptyState?: React.ReactNode;
  loading?: boolean;
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
    <tr className={`border-b border-stone-100 transition-colors ${isSelected ? 'bg-brand/5' : 'hover:bg-stone-50/50'}`}>
      {selectable && (
        <td className="p-3 w-10 sticky left-0 z-10 bg-surface">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection && onToggleSelection(id)}
            className="w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand cursor-pointer"
            aria-label={`Select row ${String(id)}`}
          />
        </td>
      )}
      {columns.map((col) => (
        <td key={col.key as string} className="p-3.5 text-sm text-text-primary">
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
  onClearSelection,
  emptyState,
  loading = false
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

  if (loading) {
    return (
      <div className="admin-card p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-text-secondary">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="admin-card">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden font-['Mukta']">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-50/70 border-b border-stone-200">
            <tr>
              {selectable && (
                <th className="p-3.5 w-10 sticky left-0 z-20 bg-stone-50/70">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => { if (input) input.indeterminate = someSelected; }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={`p-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wide ${col.sortable ? "cursor-pointer select-none hover:text-text-primary" : "select-none"}`}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-stone-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand" /> : <ArrowDown className="w-3.5 h-3.5 text-brand" />
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

        {data.length === 0 && !emptyState && (
          <div className="p-12 text-center">
            <p className="text-text-secondary">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent;