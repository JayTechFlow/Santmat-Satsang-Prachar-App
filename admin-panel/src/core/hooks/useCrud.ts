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

  const queryOptionsStr = JSON.stringify(queryOptions || {});
  const initialPaginationStr = JSON.stringify(initialPagination || null);

  const fetchData = useCallback(async (pageOptions?: PaginationOptions) => {
    setLoading(true);
    setError(null);
    try {
      const parsedPagination = initialPaginationStr !== 'null' ? JSON.parse(initialPaginationStr) : undefined;
      const parsedQueryOptions = JSON.parse(queryOptionsStr);
      if (pageOptions || parsedPagination) {
        const result = await service.paginate(pageOptions || parsedPagination || {}, parsedQueryOptions);
        setData(result.data);
        setPaginationInfo({ lastDoc: result.lastDoc, total: result.total });
      } else {
        const result = await service.getAll(parsedQueryOptions);
        setData(result);
        setPaginationInfo({ lastDoc: null, total: result.length });
      }
    } catch (err: any) {
      setError(err as AppError);
      showError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [service, queryOptionsStr, initialPaginationStr, showError]);

  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);
    setError(null);
    const parsedPagination = initialPaginationStr !== 'null' ? JSON.parse(initialPaginationStr) : undefined;
    const parsedQueryOptions = JSON.parse(queryOptionsStr);
    
    const runFetch = async () => {
      try {
        if (parsedPagination) {
          const result = await service.paginate(parsedPagination, parsedQueryOptions);
          if (isSubscribed) {
            setData(result.data);
            setPaginationInfo({ lastDoc: result.lastDoc, total: result.total });
          }
        } else {
          const result = await service.getAll(parsedQueryOptions);
          if (isSubscribed) {
            setData(result);
            setPaginationInfo({ lastDoc: null, total: result.length });
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          setError(err as AppError);
          showError(err.message || 'Failed to load data');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    runFetch();

    return () => {
      isSubscribed = false;
    };
  }, [service, queryOptionsStr, initialPaginationStr, showError]);

  const refresh = () => fetchData();

  return {
    data,
    loading,
    error,
    refresh,
    pagination: paginationInfo,
  };
}
