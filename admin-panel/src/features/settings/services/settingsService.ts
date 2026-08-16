import { BaseCrudService } from '../../../core/services/BaseCrudService';
import { settingsRepository, SettingsRepository } from '../repositories/settingsRepository';
import type { AppSettings } from '../types/settings.types';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'global_config',
  appName: 'Santmat Satsang Prachar',
  contactEmail: 'support@santmatsatsang.org',
  maintenanceMode: false,
  maxAudioSizeMb: 100,
  maxPdfSizeMb: 50,
  maxBannersCount: 10,
  enableAudioStreaming: true,
  enableBookDownloads: true,
  enableAiRecommendations: true,
  enableNotifications: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export class SettingsService extends BaseCrudService<AppSettings> {
  constructor(repo: SettingsRepository) {
    super(repo);
  }

  async getGlobalSettings(): Promise<AppSettings> {
    try {
      const settings = await this.getById('global_config');
      if (settings) return settings;
    } catch {
      // Fallback to default configuration
    }
    return DEFAULT_SETTINGS;
  }

  async saveGlobalSettings(settings: Partial<AppSettings>, updatedBy: string): Promise<AppSettings> {
    const existing = await this.getGlobalSettings();
    const payload: AppSettings = {
      ...existing,
      ...settings,
      id: 'global_config',
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    try {
      await this.repository.update('global_config', payload);
    } catch {
      await this.repository.create(payload, 'global_config');
    }
    return payload;
  }
}

export const settingsService = new SettingsService(settingsRepository);
