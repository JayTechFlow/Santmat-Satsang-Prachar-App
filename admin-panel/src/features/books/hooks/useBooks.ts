import { useState, useMemo } from 'react';
import { useList } from '../../../core/hooks/useList';
import { bookService } from '../services/bookService';
import type { BookDTO, PublishStatus } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useBooks() {
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

  const list = useList<BookDTO>(bookService, {
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
