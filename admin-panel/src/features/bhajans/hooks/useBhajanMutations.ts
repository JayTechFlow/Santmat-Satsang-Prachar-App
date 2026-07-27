import { useState } from 'react';
import { bhajanService } from '../services/bhajanService';
import { useToast } from '../../../hooks/useToast';
import type { BhajanDTO } from '../types';

export function useBhajanMutations(onSuccessCallback?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success: successToast, error: errorToast } = useToast();

  const createBhajan = async (data: Partial<BhajanDTO>) => {
    try {
      setLoading(true);
      setError(null);
      await bhajanService.createBhajan(data);
      successToast("Bhajan added successfully");
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } catch (err: any) {
      const msg = err.message || "Failed to create bhajan";
      setError(msg);
      errorToast(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBhajan = async (id: string, data: Partial<BhajanDTO>) => {
    try {
      setLoading(true);
      setError(null);
      await bhajanService.updateBhajan(id, data);
      successToast("Bhajan updated successfully");
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } catch (err: any) {
      const msg = err.message || "Failed to update bhajan";
      setError(msg);
      errorToast(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBhajan = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await bhajanService.deleteBhajan(id);
      successToast("Bhajan deleted successfully");
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } catch (err: any) {
      const msg = err.message || "Failed to delete bhajan";
      setError(msg);
      errorToast(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createBhajan, updateBhajan, deleteBhajan, loading, error };
}
