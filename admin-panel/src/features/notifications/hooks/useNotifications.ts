import { useState, useMemo } from 'react';
import { useCrud } from '../../../core/hooks/useCrud';
import { notificationService } from '../services/notificationService';
import type { NotificationDTO, PushStatus, Audience, TargetScreen } from '../types';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';

export function useNotifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | PushStatus>('all');
  const [audienceFilter, setAudienceFilter] = useState<'all' | Audience>('all');
  const [targetScreenFilter, setTargetScreenFilter] = useState<'all' | TargetScreen>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const constraints = useMemo(() => {
    const _constraints: QueryConstraint[] = [];
    
    // Sort by createdAt usually
    _constraints.push(orderBy('createdAt', sortOrder));

    if (statusFilter !== 'all') {
      _constraints.push(where('pushStatus', '==', statusFilter));
    }
    
    if (audienceFilter !== 'all') {
      _constraints.push(where('audience', '==', audienceFilter));
    }

    if (targetScreenFilter !== 'all') {
      _constraints.push(where('targetScreen', '==', targetScreenFilter));
    }

    if (searchTerm) {
      _constraints.push(where('title', '>=', searchTerm));
      _constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
    }

    return _constraints;
  }, [searchTerm, sortOrder, statusFilter, audienceFilter, targetScreenFilter]);

  const { data: rawData, loading, error, refresh, pagination } = useCrud<NotificationDTO>(
    notificationService,
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
    audienceFilter,
    setAudienceFilter,
    targetScreenFilter,
    setTargetScreenFilter,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil((pagination.total || 0) / itemsPerPage) || 1,
  };
}
