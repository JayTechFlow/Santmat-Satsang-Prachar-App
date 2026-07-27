import { useState, useCallback } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { userService } from '../services/userService';
import type { UserDTO, UserStatus } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const buildConstraints = useCallback(() => {
    const constraints: QueryConstraint[] = [];
    
    constraints.push(orderBy('createdAt', sortOrder));

    if (statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }
    
    if (roleFilter !== 'all') {
      constraints.push(where('roleIds', 'array-contains', roleFilter));
    }

    if (departmentFilter !== 'all') {
      constraints.push(where('department', '==', departmentFilter));
    }

    if (searchTerm) {
      constraints.push(where('fullName', '>=', searchTerm));
      constraints.push(where('fullName', '<=', searchTerm + '\uf8ff'));
    }

    return constraints;
  }, [searchTerm, sortOrder, statusFilter, roleFilter, departmentFilter]);

  const { data, loading, error, refresh, pagination } = useCrud<UserDTO>(
    userService,
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
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil((pagination.total || 0) / itemsPerPage) || 1,
  };
}
