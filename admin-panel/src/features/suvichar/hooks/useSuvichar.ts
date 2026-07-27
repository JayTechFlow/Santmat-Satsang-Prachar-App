import { useState, useCallback } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { suvicharService } from '../services/suvicharService';
import type { SuvicharDTO } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useSuvichar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Build query constraints dynamically
  const buildConstraints = useCallback(() => {
    const constraints: QueryConstraint[] = [];
    
    // Sort
    constraints.push(orderBy('createdAt', sortOrder));

    // Note: In Firestore, filtering by string match is limited. 
    // Usually handled client-side or with basic bounds if required.
    // For this example, we keep constraints simple and handle search client-side for tiny datasets,
    // or add startAt/endAt for title prefix search.
    if (searchTerm) {
      constraints.push(where('title', '>=', searchTerm));
      constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
    }

    return constraints;
  }, [searchTerm, sortOrder]);

  const { data, loading, error, refresh, pagination } = useCrud<SuvicharDTO>(
    suvicharService,
    buildConstraints(),
    { limit: pageSize } // Optional if we want to handle pagination strictly
  );

  // In this simple implementation, we might just fetch all and paginate client-side,
  // or use the server-side pagination info.
  // The useCrud hook already uses paginate if options are provided.

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
    totalPages: Math.ceil((pagination.total || 0) / pageSize) || 1,
  };
}
