import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService, DEFAULT_SETTINGS } from '../services/settingsService';
import { getDoc, setDoc } from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('../../../lib/firebase/config', () => ({
  db: {},
}));

describe('SettingsService — Canonical Contract & RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSettings — returns DEFAULT_SETTINGS when document does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as any);

    const res = await settingsService.getSettings();
    expect(res.success).toBe(true);
    expect(res.data).toEqual(DEFAULT_SETTINGS);
  });

  it('getSettings — merges existing Firestore data with default settings', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        siteTitle: 'कस्टम आश्रम शीर्षक',
        maintenanceMode: true,
      }),
    } as any);

    const res = await settingsService.getSettings();
    expect(res.success).toBe(true);
    expect(res.data?.siteTitle).toBe('कस्टम आश्रम शीर्षक');
    expect(res.data?.maintenanceMode).toBe(true);
    expect(res.data?.contactEmail).toBe(DEFAULT_SETTINGS.contactEmail);
  });

  it('updateSettings — allows developer_super_admin to update all system & platform fields', async () => {
    vi.mocked(setDoc).mockResolvedValueOnce(undefined);

    const updatePayload = {
      siteTitle: 'नया शीर्षक',
      maintenanceMode: true,
      maxUploadSizeBytes: 104857600,
    };

    const res = await settingsService.updateSettings(updatePayload, 'developer_super_admin');
    expect(res.success).toBe(true);
    expect(setDoc).toHaveBeenCalledTimes(1);

    const passedDoc = vi.mocked(setDoc).mock.calls[0][1];
    expect(passedDoc.siteTitle).toBe('नया शीर्षक');
    expect(passedDoc.maintenanceMode).toBe(true);
    expect(passedDoc.maxUploadSizeBytes).toBe(104857600);
    expect(passedDoc.updatedAt).toBeDefined();
  });

  it('updateSettings — strips developer-only fields when caller is client_super_admin', async () => {
    vi.mocked(setDoc).mockResolvedValueOnce(undefined);

    const updatePayload = {
      siteTitle: 'क्लाइंट एडमिन शीर्षक',
      maintenanceMode: true,
      maxUploadSizeBytes: 104857600,
    };

    const res = await settingsService.updateSettings(updatePayload, 'client_super_admin');
    expect(res.success).toBe(true);
    expect(setDoc).toHaveBeenCalledTimes(1);

    const passedDoc = vi.mocked(setDoc).mock.calls[0][1];
    expect(passedDoc.siteTitle).toBe('क्लाइंट एडमिन शीर्षक');
    expect(passedDoc.maintenanceMode).toBeUndefined();
    expect(passedDoc.maxUploadSizeBytes).toBeUndefined();
  });

  it('updateSettings — surfaces error when setDoc fails (no fake success)', async () => {
    vi.mocked(setDoc).mockRejectedValueOnce(new Error('Firestore write permission-denied'));

    const res = await settingsService.updateSettings({ siteTitle: 'विफलता परीक्षण' }, 'developer_super_admin');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Firestore write permission-denied');
  });
});
