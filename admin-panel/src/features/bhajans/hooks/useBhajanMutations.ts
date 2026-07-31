import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { bhajanService } from '../services/bhajanService';
import type { BhajanDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useBhajanMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<BhajanDTO>(bhajanService);

  const handleCreate = async (data: Partial<BhajanDTO>) => {
    const result = await mutations.create(data as BhajanDTO);
    if (result) {
      success('Bhajan created successfully');
      if (onSuccessCallback) onSuccessCallback();
    } else if (mutations.error) {
      showError(mutations.error.message);
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<BhajanDTO>) => {
    await mutations.update(id, data);
    if (!mutations.error) {
      success('Bhajan updated successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    await mutations.delete(id);
    if (!mutations.error) {
      success('Bhajan deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
      return false;
    }
  };

  return {
    createBhajan: handleCreate,
    updateBhajan: handleUpdate,
    deleteBhajan: handleDelete,
    loading: mutations.loading,
    error: mutations.error,
  };
}
