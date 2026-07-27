import { dashboardRepository } from '../repositories/dashboardRepository';
import type { DashboardStatsViewModel, DashboardStatsDTO, ActivityItemDTO, BhajanDTO, ChartDataDTO } from '../types';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStatsViewModel[]> {
    const stats: DashboardStatsDTO = {
      bhajans: await dashboardRepository.getCollectionCount('audio'),
      stutiVinati: await dashboardRepository.getCollectionCount('stuti_vinati'),
      users: await dashboardRepository.getCollectionCount('users'),
      notifications: await dashboardRepository.getCollectionCount('notifications'),
      books: await dashboardRepository.getCollectionCount('books'),
    };

    return [
      { label: 'Bhajans', value: stats.bhajans, icon: 'Music', path: '/bhajans', color: 'var(--primary)' },
      { label: 'Stuti & Vinati', value: stats.stutiVinati, icon: 'BookOpen', path: '/stuti-vinati', color: 'var(--success)' },
      { label: 'Users', value: stats.users, icon: 'Users', path: '/users', color: 'var(--danger)' },
      { label: 'Notifications', value: stats.notifications, icon: 'Bell', path: '/notifications', color: '#8b5cf6' },
      { label: 'Books', value: stats.books, icon: 'BookOpen', path: '/books', color: '#f59e0b' },
    ];
  },

  async getRecentActivities(): Promise<ActivityItemDTO[]> {
    return dashboardRepository.getRecentActivities();
  },

  async getTopBhajans(): Promise<BhajanDTO[]> {
    return dashboardRepository.getTopBhajans();
  },
  
  async getAnalytics(dateRange: string): Promise<ChartDataDTO[]> {
    return dashboardRepository.getAnalyticsData(dateRange);
  }
};
