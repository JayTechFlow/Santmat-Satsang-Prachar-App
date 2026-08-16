// Sprint M7.7 — useAIAnalytics Hook

import { useState, useEffect, useCallback } from 'react';
import { AIAnalyticsService } from '../services/aiAnalyticsService';
import type { AIPersonalizationDashboardData, AnalyticsPeriod } from '../types/aiAnalytics.types';

export function useAIAnalytics(initialPeriod: AnalyticsPeriod = '30d') {
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [data, setData] = useState<AIPersonalizationDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await AIAnalyticsService.fetchDashboardData(period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load AI analytics data'));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = useCallback(() => {
    if (data) {
      AIAnalyticsService.exportReport(period, data);
    }
  }, [data, period]);

  return {
    period,
    setPeriod,
    data,
    loading,
    error,
    refresh: loadData,
    exportReport: handleExport,
  };
}
