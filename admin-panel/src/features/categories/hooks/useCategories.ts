import { useState, useMemo } from 'react';
import { useList } from '../../../core/hooks/useList';
import { categoryService } from '../services/categoryService';
import type { CategoryDTO } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useCategories() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const additionalFilters = useMemo(() => {
    const filters: QueryFilter[] = [];
    if (statusFilter !== 'all') {
      filters.push({ field: 'status', operator: '==', value: statusFilter });
    }
    if (typeFilter !== 'all') {
      filters.push({ field: 'type', operator: '==', value: typeFilter });
    }
    return filters;
  }, [statusFilter, typeFilter]);

  const list = useList<CategoryDTO>(categoryService, {
    additionalFilters,
    searchField: 'name'
  });

  return {
    ...list,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
  };
}
