import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { suvicharService } from '../services/suvicharService';
import type { SuvicharDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useSuvicharMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<SuvicharDTO>(suvicharService);

  const handleCreate = async (data: Omit<SuvicharDTO, 'id'>) => {
    let result = null;
    try {
      result = await mutations.create(data as SuvicharDTO);
      if (result) {
      success('Suvichar created successfully');
      if (onSuccessCallback) onSuccessCallback();
    }
    } catch (err: any) {
      showError(err.message || 'Error occurred');
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<SuvicharDTO>) => {
    try {
      await mutations.update(id, data);
      
      success('Suvichar updated successfully');
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
      
      success('Suvichar deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
        } catch (err: any) {
      showError(err.message || 'Error occurred');
      return false;
    }
  };

  return {
    createSuvichar: handleCreate,
    updateSuvichar: handleUpdate,
    deleteSuvichar: handleDelete,
    loading: mutations.loading,
    error: mutations.error,
  };
}
