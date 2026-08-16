export interface DashboardStatsDTO {
  bhajans: number;
  stutiVinati: number;
  users: number;
  notifications: number;
  books: number;
}

export interface ActivityItemDTO {
  id: string;
  type: 'audio' | 'book' | 'stuti_vinati' | 'suvichar' | 'user';
  title: string;
  timestamp: number;
}

export interface BhajanDTO {
  id: string;
  title: string;
  plays: number;
  createdAt: number;
}

export interface ChartDataDTO {
  date: string;
  value: number;
}

export interface DashboardStatsViewModel {
  label: string;
  value: number;
  icon: string;
  path: string;
  color: string;
}
