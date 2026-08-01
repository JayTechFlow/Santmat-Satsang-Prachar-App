import { useState, useMemo } from 'react';
import { useCrud } from './useCrud';
import type { BaseCrudService } from '../services/BaseCrudService';
import type { CustomQueryOptions, QueryFilter } from '../repositories/BaseRepository';

export interface UseListOptions {
  itemsPerPage?: number;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  additionalFilters?: QueryFilter[];
  searchField?: string;
}

export function useList<T extends { id: string }>(
  service: BaseCrudService<T>,
  options: UseListOptions = {}
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>(options.defaultSort?.direction || 'desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = options.itemsPerPage || 10;

  const queryOptions = useMemo<CustomQueryOptions>(() => {
    const filters: QueryFilter[] = options.additionalFilters ? [...options.additionalFilters] : [];

    if (searchTerm && options.searchField) {
      filters.push({ field: options.searchField, operator: '>=', value: searchTerm });
      filters.push({ field: options.searchField, operator: '<=', value: searchTerm + '\uf8ff' });
    }

    const sorts: CustomQueryOptions['sorts'] = [
      { field: options.defaultSort?.field || 'createdAt', direction: sortOrder }
    ];

    return { filters, sorts };
  }, [searchTerm, sortOrder, options.additionalFilters, options.searchField]);

  const { data: rawData, loading, error, refresh, pagination } = useCrud<T>(
    service,
    queryOptions
  );

  const paginatedData = rawData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    data: paginatedData,
    loading,
    error,
    refetch: refresh,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    goToPage: setCurrentPage,
    totalPages: Math.ceil((pagination.total || rawData.length) / itemsPerPage) || 1,
    rawData,
  };
}
