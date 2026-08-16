import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SystemSettings, ServiceResponse } from '../types';

const SETTINGS_COLLECTION = 'app_settings';
const SETTINGS_DOC_ID = 'system';

const DEFAULT_SETTINGS: SystemSettings = {
  siteTitle: 'संतमत सत्संग प्रचार',
  contactEmail: 'contact@santmatsatsang.org',
  contactPhone: '+91 98765 43210',
  maintenanceMode: false,
  allowNewRegistrations: true,
  organizationName: 'महर्षि मेँहीं आश्रम',
  maxUploadSizeBytes: 52428800
};

export class SettingsService {
  async getSettings(): Promise<ServiceResponse<SystemSettings>> {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
      if (!snap.exists()) {
        return { success: true, data: DEFAULT_SETTINGS };
      }
      return { success: true, data: snap.data() as SystemSettings };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load system settings' };
    }
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<ServiceResponse<void>> {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), settings, { merge: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update system settings' };
    }
  }
}

export const settingsService = new SettingsService();
