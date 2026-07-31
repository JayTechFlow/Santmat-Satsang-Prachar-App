import { useState, useCallback } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { bhajanService } from '../services/bhajanService';
import type { BhajanDTO } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useBhajans() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const buildConstraints = useCallback(() => {
    const constraints: QueryConstraint[] = [];
    constraints.push(orderBy('createdAt', sortOrder));

    if (searchTerm) {
      constraints.push(where('title', '>=', searchTerm));
      constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
    }

    return constraints;
  }, [searchTerm, sortOrder]);

  const { data, loading, error, refresh, pagination } = useCrud<BhajanDTO>(
    bhajanService,
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
    currentPage,
    setCurrentPage,
    goToPage: setCurrentPage,
    totalPages: Math.ceil((pagination.total || 0) / itemsPerPage) || 1,
  };
}
