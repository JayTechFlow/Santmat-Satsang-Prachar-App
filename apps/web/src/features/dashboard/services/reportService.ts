import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase/config';
import { ServiceResponse } from '../../../types/common/index';

/**
 * Analytics report integration.
 * Backend contract (admin-panel analyticsReportService): callable Cloud Function
 * `analytics-getAnalyticsSummary` returns `{ data: { daily: [], overview: {} } }`.
 * No fabricated metrics — failures surface an explicit error state.
 */
export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface DailyAnalyticsSnapshot {
  date: string;
  totalPlays: number;
  uniqueActiveUsers: number;
  totalListenDurationSeconds: number;
  newRegistrations: number;
  totalInteractions: number;
  topCategory?: string;
  updatedAt?: unknown;
}

export interface AnalyticsOverview {
  lastUpdatedDate?: string;
  latestDau?: number;
  latestDailyPlays?: number;
  updatedAt?: unknown;
}

export interface AnalyticsReportData {
  daily: DailyAnalyticsSnapshot[];
  overview: AnalyticsOverview | null;
}

export interface AnalyticsReportResponse {
  status: string;
  data: AnalyticsReportData;
}

export class ReportService {
  /**
   * Fetch analytics summary via the production callable Cloud Function.
   */
  async getAnalyticsSummary(query: AnalyticsQuery = {}): Promise<ServiceResponse<AnalyticsReportData>> {
    try {
      const getSummaryFn = httpsCallable<AnalyticsQuery, AnalyticsReportResponse>(
        functions,
        'analytics-getAnalyticsSummary'
      );
      const response = await getSummaryFn(query);
      if (!response.data || !Array.isArray(response.data.data.daily)) {
        return { success: false, error: 'Unexpected response from analytics service' };
      }
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Analytics report unavailable' };
    }
  }
}

export const reportService = new ReportService();
