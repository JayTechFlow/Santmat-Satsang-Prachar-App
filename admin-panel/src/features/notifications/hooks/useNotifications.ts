import { useState, useMemo } from 'react';
import { useList } from '../../../core/hooks/useList';
import { notificationService } from '../services/notificationService';
import type { NotificationDTO, PushStatus, Audience, TargetScreen } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useNotifications() {
  const [statusFilter, setStatusFilter] = useState<'all' | PushStatus>('all');
  const [audienceFilter, setAudienceFilter] = useState<'all' | Audience>('all');
  const [targetScreenFilter, setTargetScreenFilter] = useState<'all' | TargetScreen>('all');

  const additionalFilters = useMemo(() => {
    const filters: QueryFilter[] = [];
    if (statusFilter !== 'all') {
      filters.push({ field: 'pushStatus', operator: '==', value: statusFilter });
    }
    if (audienceFilter !== 'all') {
      filters.push({ field: 'audience', operator: '==', value: audienceFilter });
    }
    if (targetScreenFilter !== 'all') {
      filters.push({ field: 'targetScreen', operator: '==', value: targetScreenFilter });
    }
    return filters;
  }, [statusFilter, audienceFilter, targetScreenFilter]);

  const list = useList<NotificationDTO>(notificationService, {
    additionalFilters,
    searchField: 'title'
  });

  return {
    ...list,
    statusFilter,
    setStatusFilter,
    audienceFilter,
    setAudienceFilter,
    targetScreenFilter,
    setTargetScreenFilter,
  };
}
