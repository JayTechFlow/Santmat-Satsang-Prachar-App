import { useState, useEffect } from 'react';
import { bhajanService } from '../services/bhajanService';
import { BhajanEntity } from '../types';

export function useBhajans() {
  const [bhajans, setBhajans] = useState<BhajanEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = bhajanService.subscribeBhajans((list) => {
      setBhajans(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addBhajan = async (payload: Omit<BhajanEntity, 'id'>) => {
    const res = await bhajanService.addBhajan(payload);
    if (!res.success) setError(res.error || 'Failed to add bhajan');
    return res;
  };

  const updateBhajan = async (id: string, updates: Partial<BhajanEntity>) => {
    const res = await bhajanService.updateBhajan(id, updates);
    if (!res.success) setError(res.error || 'Failed to update bhajan');
    return res;
  };

  const deleteBhajan = async (id: string) => {
    const res = await bhajanService.deleteBhajan(id);
    if (!res.success) setError(res.error || 'Failed to delete bhajan');
    return res;
  };

  return {
    bhajans,
    loading,
    error,
    addBhajan,
    updateBhajan,
    deleteBhajan
  };
}
