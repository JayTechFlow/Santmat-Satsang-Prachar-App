
import { useList } from '../../../core/hooks/useList';
import { suvicharService } from '../services/suvicharService';
import type { SuvicharDTO } from '../types';
import type { QueryFilter } from '../../../core/repositories/BaseRepository';

export function useSuvichar() {

  const additionalFilters: QueryFilter[] = [];

  const list = useList<SuvicharDTO>(suvicharService, {
    additionalFilters,
    searchField: 'content'
  });

  return {
    ...list,
  };
}
