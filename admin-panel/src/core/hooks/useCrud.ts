import { useState, useEffect, useCallback } from 'react';
import { BaseCrudService } from '../services/BaseCrudService';
import { AppError } from '../errors/AppError';
import type { PaginationOptions, PaginatedResult } from '../repositories/BaseRepository';
import { QueryConstraint } from 'firebase/firestore';
import { useToast } from '../../hooks/useToast';

export function useCrud<T extends { id: string }>(
  service: BaseCrudService<T>,
  constraints: QueryConstraint[] = [],
  initialPagination?: PaginationOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<Omit<PaginatedResult<T>, 'data'>>({
    lastDoc: null,
    total: 0,
  });
  const { error: showError } = useToast();

  const initialPaginationStr = JSON.stringify(initialPagination || null);

  const fetchData = useCallback(async (pageOptions?: PaginationOptions) => {
    setLoading(true);
    setError(null);
    try {
      const parsedPagination = initialPaginationStr !== 'null' ? JSON.parse(initialPaginationStr) : undefined;
      if (pageOptions || parsedPagination) {
        const result = await service.paginate(pageOptions || parsedPagination || {}, constraints);
        setData(result.data);
        setPaginationInfo({ lastDoc: result.lastDoc, total: result.total });
      } else {
        const result = await service.getAll(constraints);
        setData(result);
        setPaginationInfo({ lastDoc: null, total: result.length });
      }
    } catch (err: any) {
      setError(err as AppError);
      showError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [service, constraints, initialPaginationStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => fetchData();

  return {
    data,
    loading,
    error,
    refresh,
    pagination: paginationInfo,
  };
}
