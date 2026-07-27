import { useState, useEffect, useRef } from 'react';
import { bhajanService } from '../services/bhajanService';
import type { BhajanViewModel } from '../types';

export function useBhajans() {
  const [data, setData] = useState<BhajanViewModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [search, setSearch] = useState('');
  const [_filter, setFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const cursorsRef = useRef<any[]>([null]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const loadPage = async (page: number, isNewFilter: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      if (isNewFilter) {
        cursorsRef.current = [null];
      }
      const lastDoc = cursorsRef.current[page - 1] || null;
      const result = await bhajanService.fetchBhajans(search, _filter, sort, pageSize, lastDoc);
      setData(result.data);
      setTotalCount(result.totalCount);
      
      if (result.lastDoc) {
        cursorsRef.current[page] = result.lastDoc;
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, _filter, sort, pageSize]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      loadPage(next);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      loadPage(prev);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      loadPage(page);
    }
  };

  const refetch = () => {
    loadPage(currentPage);
  };

  return {
    data,
    loading,
    error,
    isEmpty: data.length === 0,
    search,
    setSearch,
    _filter,
    setFilter,
    sort,
    setSort,
    refetch,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage
  };
}
