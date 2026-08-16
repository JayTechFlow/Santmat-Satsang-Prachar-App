import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { bhajanService } from '../services/bhajanService';
import type { BhajanDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useBhajanMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<BhajanDTO>(bhajanService);

  const handleCreate = async (data: Partial<BhajanDTO>) => {
    let result = null;
    try {
      result = await mutations.create(data as BhajanDTO);
      if (result) {
      success('Bhajan created successfully');
      if (onSuccessCallback) onSuccessCallback();
    }
    } catch (err: any) {
      showError(err.message || 'Error occurred');
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<BhajanDTO>) => {
    try {
      await mutations.update(id, data);
      
      success('Bhajan updated successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
        } catch (err: any) {
      showError(err.message || 'Error occurred');
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await mutations.delete(id);
      
      success('Bhajan deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
        } catch (err: any) {
      showError(err.message || 'Error occurred');
      return false;
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await mutations.delete(id);
      }
    } catch {
      return false;
    }
  };

  return {
    createBhajan: handleCreate,
    updateBhajan: handleUpdate,
    deleteBhajan: handleDelete,
    bulkDeleteBhajans: handleBulkDelete,
    loading: mutations.loading,
    error: mutations.error,
  };
}
