import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStatsViewModel, ActivityItemDTO, BhajanDTO, ChartDataDTO } from '../types';

interface DashboardData {
  stats: DashboardStatsViewModel[];
  activities: ActivityItemDTO[];
  topBhajans: BhajanDTO[];
  analytics: ChartDataDTO[];
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({ stats: [], activities: [], topBhajans: [], analytics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dateFilter, setDateFilter] = useState('7days');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, activities, topBhajans, analytics] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivities(),
        dashboardService.getTopBhajans(),
        dashboardService.getAnalytics(dateFilter)
      ]);

      setData({ stats, activities, topBhajans, analytics });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isEmpty = data.stats.length === 0 && data.activities.length === 0 && data.topBhajans.length === 0;

  return {
    data,
    loading,
    error,
    isEmpty,
    dateFilter,
    setDateFilter,
    refetch: fetchData
  };
};
