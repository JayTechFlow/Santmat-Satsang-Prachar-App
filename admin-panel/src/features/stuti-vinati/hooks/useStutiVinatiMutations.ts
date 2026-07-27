import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { stutiVinatiService } from '../services/stutiVinatiService';
import type { StutiVinatiDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useStutiVinatiMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<StutiVinatiDTO>(stutiVinatiService);

  const handleCreate = async (data: Omit<StutiVinatiDTO, 'id'>) => {
    const result = await mutations.create(data as StutiVinatiDTO);
    if (result) {
      success('Prayer created successfully');
      if (onSuccessCallback) onSuccessCallback();
    } else if (mutations.error) {
      showError(mutations.error.message);
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<StutiVinatiDTO>) => {
    await mutations.update(id, data);
    if (!mutations.error) {
      success('Prayer updated successfully');
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
      success('Prayer deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
      return false;
    }
  };

  const handleArchive = async (id: string, archive: boolean) => {
    await handleUpdate(id, { publishStatus: archive ? 'archived' : 'draft' });
  };
  
  const handleAssignCategory = async (id: string, categoryId: string) => {
    await handleUpdate(id, { categoryId });
  };

  return {
    createPrayer: handleCreate,
    updatePrayer: handleUpdate,
    deletePrayer: handleDelete,
    archivePrayer: handleArchive,
    assignCategory: handleAssignCategory,
    loading: mutations.loading,
    error: mutations.error,
  };
}
