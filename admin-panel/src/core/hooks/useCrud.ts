import { useState, useEffect, useCallback } from 'react';
import { BaseCrudService } from '../services/BaseCrudService';
import { AppError } from '../errors/AppError';
import type { PaginationOptions, PaginatedResult } from '../repositories/BaseRepository';
import { QueryConstraint } from 'firebase/firestore';

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

  const fetchData = useCallback(async (pageOptions?: PaginationOptions) => {
    setLoading(true);
    setError(null);
    try {
      if (pageOptions || initialPagination) {
        const result = await service.paginate(pageOptions || initialPagination || {}, constraints);
        setData(result.data);
        setPaginationInfo({ lastDoc: result.lastDoc, total: result.total });
      } else {
        const result = await service.getAll(constraints);
        setData(result);
        setPaginationInfo({ lastDoc: null, total: result.length });
      }
    } catch (err) {
      setError(err as AppError);
    } finally {
      setLoading(false);
    }
  }, [service, constraints, initialPagination]);

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
