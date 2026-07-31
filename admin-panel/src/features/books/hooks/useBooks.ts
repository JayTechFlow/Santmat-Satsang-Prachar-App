import { useState, useMemo } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { bookService } from '../services/bookService';
import type { BookDTO, PublishStatus } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useBooks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const constraints = useMemo(() => {
    const _constraints: QueryConstraint[] = [];
    
    _constraints.push(orderBy('createdAt', sortOrder));

    if (statusFilter !== 'all') {
      _constraints.push(where('publishStatus', '==', statusFilter));
    }
    
    if (categoryFilter !== 'all') {
      _constraints.push(where('categoryId', '==', categoryFilter));
    }

    if (searchTerm) {
      _constraints.push(where('title', '>=', searchTerm));
      _constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
    }

    return _constraints;
  }, [searchTerm, sortOrder, statusFilter, categoryFilter]);

  const { data: rawData, loading, error, refresh, pagination } = useCrud<BookDTO>(
    bookService,
    constraints
  );

  const paginatedData = rawData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    data: paginatedData,
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
