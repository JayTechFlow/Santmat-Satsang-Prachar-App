import { useState, useMemo } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { categoryService } from '../services/categoryService';
import type { CategoryDTO } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useCategories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Note: For hierarchical data, we usually fetch everything or fetch roots and lazy-load children.
  // Given standard category limits, fetching all and building the tree client-side is best.
  // We will fetch all without limits here to easily build the tree view.
  
  const constraints = useMemo(() => {
    const _constraints: QueryConstraint[] = [];
    
    // Sort by sortOrder then name
    _constraints.push(orderBy('sortOrder', sortOrder));

    if (statusFilter !== 'all') {
      _constraints.push(where('status', '==', statusFilter));
    }
    
    if (typeFilter !== 'all') {
      _constraints.push(where('type', '==', typeFilter));
    }

    if (searchTerm) {
      _constraints.push(where('name', '>=', searchTerm));
      _constraints.push(where('name', '<=', searchTerm + '\uf8ff'));
    }

    return _constraints;
  }, [searchTerm, sortOrder, statusFilter, typeFilter]);

  const { data, loading, error, refresh } = useCrud<CategoryDTO>(
    categoryService,
    constraints
    // No pagination limits, to fetch the whole tree
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
    typeFilter,
    setTypeFilter,
  };
}
