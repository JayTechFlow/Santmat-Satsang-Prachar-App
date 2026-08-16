import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';
import type { AppSettings } from '../types/settings.types';
import { useToast } from '../../../hooks/useToast';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getGlobalSettings();
      setSettings(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load system settings');
      setError(e);
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (partial: Partial<AppSettings>, updatedBy: string): Promise<boolean> => {
    try {
      const updated = await settingsService.saveGlobalSettings(partial, updatedBy);
      setSettings(updated);
      showToast('Settings saved successfully', 'success');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      showToast(msg, 'error');
      return false;
    }
  };

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  };
}
