import { useState, useCallback } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { stutiVinatiService } from '../services/stutiVinatiService';
import type { StutiVinatiDTO, PublishStatus } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useStutiVinati() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const buildConstraints = useCallback(() => {
    const constraints: QueryConstraint[] = [];
    
    constraints.push(orderBy('readingOrder', sortOrder));

    if (statusFilter !== 'all') {
      constraints.push(where('publishStatus', '==', statusFilter));
    }
    
    if (categoryFilter !== 'all') {
      constraints.push(where('categoryId', '==', categoryFilter));
    }

    if (searchTerm) {
      constraints.push(where('title', '>=', searchTerm));
      constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
    }

    return constraints;
  }, [searchTerm, sortOrder, statusFilter, categoryFilter]);

  const { data, loading, error, refresh, pagination } = useCrud<StutiVinatiDTO>(
    stutiVinatiService,
    buildConstraints(),
    { limit: itemsPerPage }
  );

  return {
    data,
    loading,
    error,
    refetch: refresh,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil((pagination.total || 0) / itemsPerPage) || 1,
  };
}
