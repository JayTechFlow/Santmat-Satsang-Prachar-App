import { useState, useEffect, useCallback } from 'react';
import { BaseCrudService } from '../services/BaseCrudService';
import { AppError } from '../errors/AppError';
import type { PaginationOptions, PaginatedResult } from '../repositories/BaseRepository';
import type { CustomQueryOptions } from '../repositories/BaseRepository';
import { useToast } from '../../hooks/useToast';

export function useCrud<T extends { id: string }>(
  service: BaseCrudService<T>,
  queryOptions: CustomQueryOptions = {},
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
        const result = await service.paginate(pageOptions || parsedPagination || {}, queryOptions);
        setData(result.data);
        setPaginationInfo({ lastDoc: result.lastDoc, total: result.total });
      } else {
        const result = await service.getAll(queryOptions);
        setData(result);
        setPaginationInfo({ lastDoc: null, total: result.length });
      }
    } catch (err: any) {
      setError(err as AppError);
      showError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [service, JSON.stringify(queryOptions), initialPaginationStr, showError]);

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
