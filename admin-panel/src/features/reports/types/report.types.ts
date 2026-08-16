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