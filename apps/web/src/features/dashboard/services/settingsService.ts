import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { SystemSettings, ServiceResponse, UserRole } from '../../../types/common/index';

const SETTINGS_COLLECTION = 'app_settings';
const SETTINGS_DOC_ID = 'system';

export const DEFAULT_SETTINGS: SystemSettings = {
  siteTitle: 'संतमत सत्संग प्रचार',
  contactEmail: 'contact@santmatsatsang.org',
  contactPhone: '+91 98765 43210',
  maintenanceMode: false,
  allowNewRegistrations: true,
  organizationName: 'महर्षि मेँहीं आश्रम',
  maxUploadSizeBytes: 52428800,
};

export class SettingsService {
  async getSettings(): Promise<ServiceResponse<SystemSettings>> {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
      if (!snap.exists()) {
        return { success: true, data: { ...DEFAULT_SETTINGS } };
      }
      const data = snap.data();
      return {
        success: true,
        data: {
          ...DEFAULT_SETTINGS,
          ...data,
        } as SystemSettings,
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load system settings' };
    }
  }

  async updateSettings(
    settings: Partial<SystemSettings>,
    callerRole?: UserRole
  ): Promise<ServiceResponse<void>> {
    try {
      const updateData = { ...settings };

      // RBAC enforcement: client_super_admin cannot mutate developer-only fields
      if (callerRole === 'client_super_admin') {
        delete updateData.maintenanceMode;
        delete updateData.maxUploadSizeBytes;
      }

      const payload = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), payload, { merge: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update system settings' };
    }
  }
}

export const settingsService = new SettingsService();
