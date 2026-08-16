import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase/config';
import type { AnalyticsReportData, AnalyticsReportResponse } from '../types/report.types';

export interface AnalyticsReportQuery {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const analyticsReportService = {
  async fetchSummary(query: AnalyticsReportQuery = {}): Promise<AnalyticsReportData> {
    const callable = httpsCallable<AnalyticsReportQuery, AnalyticsReportResponse>(
      functions,
      'analytics-getAnalyticsSummary'
    );
    const res = await callable(query);

    if (!res.data || !res.data.data || !Array.isArray(res.data.data.daily)) {
      throw new Error('Unexpected response from analytics service');
    }

    return {
      daily: res.data.data.daily,
      overview: res.data.data.overview ?? null,
    };
  },
};