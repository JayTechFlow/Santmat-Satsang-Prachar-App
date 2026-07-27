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

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  onSort,
  selectable = false,
  selectedIds = [],
  onToggleSelection,
  onSelectAll,
  onClearSelection
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortKey === key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortKey(key);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(key, newDirection);
    }
  };

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (onSelectAll) {
        onSelectAll(data.map(keyExtractor));
      }
    } else {
      if (onClearSelection) {
        onClearSelection();
      }
    }
  };

  return (
    <div className="table-container" style={{ position: 'relative', overflowX: 'auto', maxHeight: '100%', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--surface)' }}>
          <tr>
            {selectable && (
              <th style={{ width: '40px', padding: 'var(--space-16) var(--space-24)', position: 'sticky', left: 0, zIndex: 11, backgroundColor: 'var(--surface)' }}>
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  ref={input => { if (input) input.indeterminate = someSelected; }}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th 
                key={col.key as string}
                style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none', padding: 'var(--space-16) var(--space-24)' }}
                onClick={() => col.sortable && handleSort(col.key as string)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  {col.header}
                  {col.sortable && (
                    <span style={{ color: 'var(--text-muted)' }}>
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
              <tr key={id} style={{ backgroundColor: isSelected ? 'var(--background)' : 'transparent' }}>
                {selectable && (
                  <td style={{ width: '40px', padding: 'var(--space-16) var(--space-24)', position: 'sticky', left: 0, zIndex: 5, backgroundColor: isSelected ? 'var(--background)' : 'var(--surface)' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggleSelection && onToggleSelection(id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key as string} style={{ padding: 'var(--space-16) var(--space-24)' }}>
                    {col.render ? col.render(item) : String((item as any)[col.key] || '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
