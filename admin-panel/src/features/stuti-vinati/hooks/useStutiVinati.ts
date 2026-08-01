import { useState, useMemo } from 'react';
import { useList } from '../../../core/hooks/useList';
import { stutiVinatiService } from '../services/stutiVinatiService';
import type { StutiVinatiDTO, PublishStatus } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useStutiVinati() {
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const additionalFilters = useMemo(() => {
    const filters: QueryFilter[] = [];
    if (statusFilter !== 'all') {
      filters.push({ field: 'publishStatus', operator: '==', value: statusFilter });
    }
    if (categoryFilter !== 'all') {
      filters.push({ field: 'categoryId', operator: '==', value: categoryFilter });
    }
    return filters;
  }, [statusFilter, categoryFilter]);

  const list = useList<StutiVinatiDTO>(stutiVinatiService, {
    additionalFilters,
    searchField: 'title'
  });

  return {
    ...list,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
  };
}
