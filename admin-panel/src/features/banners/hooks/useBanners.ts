import { useState, useMemo } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { bannerService } from '../services/bannerService';
import type { BannerDTO, BannerStatus } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useBanners() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | BannerStatus>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const constraints = useMemo(() => {
    const _constraints: QueryConstraint[] = [];
    
    // Default sorting is by creation date or priority. Let's do createdAt desc
    _constraints.push(orderBy('createdAt', sortOrder));

    // Notice we can't easily query on 'effectiveStatus' if it's derived dynamically
    // So if the user filters by 'published', we will just query by raw status in Firestore
    // and let the client handle any edge cases, or just query raw status.
    if (statusFilter !== 'all') {
      _constraints.push(where('status', '==', statusFilter));
    }

    if (searchTerm) {
      _constraints.push(where('title', '>=', searchTerm));
      _constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
    }

    return _constraints;
  }, [searchTerm, sortOrder, statusFilter]);

  const { data: rawData, loading, error, refresh, pagination } = useCrud<BannerDTO>(
    bannerService,
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
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil((pagination.total || 0) / itemsPerPage) || 1,
  };
}
