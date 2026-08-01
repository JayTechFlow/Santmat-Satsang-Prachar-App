import { useState, useMemo } from 'react';
import { useList } from '../../../core/hooks/useList';
import { bannerService } from '../services/bannerService';
import type { BannerDTO, BannerStatus } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useBanners() {
  const [statusFilter, setStatusFilter] = useState<'all' | BannerStatus>('all');

  const additionalFilters = useMemo(() => {
    const filters: QueryFilter[] = [];
    if (statusFilter !== 'all') {
      filters.push({ field: 'status', operator: '==', value: statusFilter });
    }
    return filters;
  }, [statusFilter]);

  const list = useList<BannerDTO>(bannerService, {
    additionalFilters,
    searchField: 'title'
  });

  return {
    ...list,
    statusFilter,
    setStatusFilter,
  };
}
