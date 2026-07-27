import { useState, useCallback } from 'react';
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
  
  const buildConstraints = useCallback(() => {
    const constraints: QueryConstraint[] = [];
    
    // Sort by createdAt usually
    constraints.push(orderBy('createdAt', sortOrder));

    if (statusFilter !== 'all') {
      constraints.push(where('pushStatus', '==', statusFilter));
    }
    
    if (audienceFilter !== 'all') {
      constraints.push(where('audience', '==', audienceFilter));
    }

    if (targetScreenFilter !== 'all') {
      constraints.push(where('targetScreen', '==', targetScreenFilter));
    }

    if (searchTerm) {
      constraints.push(where('title', '>=', searchTerm));
      constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
    }

    return constraints;
  }, [searchTerm, sortOrder, statusFilter, audienceFilter, targetScreenFilter]);

  const { data, loading, error, refresh, pagination } = useCrud<NotificationDTO>(
    notificationService,
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
    audienceFilter,
    setAudienceFilter,
    targetScreenFilter,
    setTargetScreenFilter,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil((pagination.total || 0) / itemsPerPage) || 1,
  };
}
