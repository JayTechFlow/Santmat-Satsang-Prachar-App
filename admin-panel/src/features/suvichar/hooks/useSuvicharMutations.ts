import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { suvicharService } from '../services/suvicharService';
import type { SuvicharDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useSuvicharMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<SuvicharDTO>(suvicharService);

  const handleCreate = async (data: Omit<SuvicharDTO, 'id'>) => {
    const result = await mutations.create(data as SuvicharDTO);
    if (result) {
      success('Suvichar created successfully');
      if (onSuccessCallback) onSuccessCallback();
    } else if (mutations.error) {
      showError(mutations.error.message);
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<SuvicharDTO>) => {
    await mutations.update(id, data);
    // useCrudMutations.update returns void on success
    if (!mutations.error) {
      success('Suvichar updated successfully');
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
      success('Suvichar deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
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
