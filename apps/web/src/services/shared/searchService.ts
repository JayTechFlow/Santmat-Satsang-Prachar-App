import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase/config';
import { ServiceResponse } from '../../types/common/index';

export interface SearchResultItem {
  id: string;
  type: 'bhajan' | 'stuti' | 'suvichar' | 'book';
  title: string;
  subtitle?: string;
  category?: string;
}

export class SearchService {
  /**
   * Execute a global search via the `search-globalSearch` callable.
   * The backend returns `{ status, data: { total, items } }` from the
   * `search_index` collection; empty index yields empty results (real state).
   */
  async globalSearch(queryText: string): Promise<ServiceResponse<SearchResultItem[]>> {
    if (!queryText.trim()) {
      return { success: true, data: [] };
    }
    try {
      const searchFn = httpsCallable<{ query: string }, { status: string; data: { total: number; items: SearchResultItem[] } }>(
        functions,
        'search-globalSearch'
      );
      const res = await searchFn({ query: queryText });
      return { success: true, data: res.data.data.items || [] };
    } catch (error: any) {
      return { success: false, error: error.message || 'Search unavailable' };
    }
  }
}

export const searchService = new SearchService();
