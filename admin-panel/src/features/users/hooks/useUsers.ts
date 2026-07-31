import { useState, useMemo } from 'react';
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
  
  const constraints = useMemo(() => {
    const _constraints: QueryConstraint[] = [];
    
    _constraints.push(orderBy('createdAt', sortOrder));

    if (statusFilter !== 'all') {
      _constraints.push(where('status', '==', statusFilter));
    }
    
    if (roleFilter !== 'all') {
      _constraints.push(where('roleIds', 'array-contains', roleFilter));
    }

    if (departmentFilter !== 'all') {
      _constraints.push(where('department', '==', departmentFilter));
    }

    if (searchTerm) {
      _constraints.push(where('fullName', '>=', searchTerm));
      _constraints.push(where('fullName', '<=', searchTerm + '\uf8ff'));
    }

    return _constraints;
  }, [searchTerm, sortOrder, statusFilter, roleFilter, departmentFilter]);

  const { data: rawData, loading, error, refresh, pagination } = useCrud<UserDTO>(
    userService,
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
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil((pagination.total || 0) / itemsPerPage) || 1,
  };
}
