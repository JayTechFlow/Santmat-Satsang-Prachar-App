import { useState, useEffect, useCallback } from 'react';
import { analyticsReportService } from '../services/analyticsReportService';
import type { AnalyticsReportData } from '../types/report.types';

const EMPTY_DATA: AnalyticsReportData = { daily: [], overview: null };

export const useAnalyticsReport = (limit = 30) => {
  const [data, setData] = useState<AnalyticsReportData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyticsReportService.fetchSummary({ limit });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, loading, error, refetch: fetchReport };
};