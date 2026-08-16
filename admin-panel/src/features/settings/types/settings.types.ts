export interface AppSettings {
  id: string;
  appName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  maxAudioSizeMb: number;
  maxPdfSizeMb: number;
  maxBannersCount: number;
  enableAudioStreaming: boolean;
  enableBookDownloads: boolean;
  enableAiRecommendations: boolean;
  enableNotifications: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type UpdateAppSettingsDto = Partial<Omit<AppSettings, 'id'>>;
