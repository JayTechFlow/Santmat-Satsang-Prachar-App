import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { db } from '../../../firebase/config';
import type { AppSettings } from '../types/settings.types';

export class SettingsRepository extends BaseRepository<AppSettings> {
  constructor() {
    super(db, 'app_settings');
  }
}

export const settingsRepository = new SettingsRepository();
