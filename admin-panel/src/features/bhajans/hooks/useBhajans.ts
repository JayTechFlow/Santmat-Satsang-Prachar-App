
import { useList } from '../../../core/hooks/useList';
import { bhajanService } from '../services/bhajanService';
import type { BhajanDTO } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useBhajans() {

  const additionalFilters: QueryFilter[] = [];

  const list = useList<BhajanDTO>(bhajanService, {
    additionalFilters,
    searchField: 'title'
  });

  return {
    ...list,
  };
}
