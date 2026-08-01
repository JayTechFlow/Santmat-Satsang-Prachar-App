import { useState, useMemo } from 'react';
import { useList } from '../../../core/hooks/useList';
import { userService } from '../services/userService';
import type { UserDTO, UserStatus } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useUsers() {
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const additionalFilters = useMemo(() => {
    const filters: QueryFilter[] = [];
    if (statusFilter !== 'all') {
      filters.push({ field: 'status', operator: '==', value: statusFilter });
    }
    if (roleFilter !== 'all') {
      filters.push({ field: 'roleIds', operator: 'array-contains', value: roleFilter });
    }
    if (departmentFilter !== 'all') {
      filters.push({ field: 'department', operator: '==', value: departmentFilter });
    }
    return filters;
  }, [statusFilter, roleFilter, departmentFilter]);

  const list = useList<UserDTO>(userService, {
    additionalFilters,
    searchField: 'fullName'
  });

  return {
    ...list,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
  };
}
