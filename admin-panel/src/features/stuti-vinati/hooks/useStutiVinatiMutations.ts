import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { stutiVinatiService } from '../services/stutiVinatiService';
import type { StutiVinatiDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useStutiVinatiMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<StutiVinatiDTO>(stutiVinatiService);

  const handleCreate = async (data: Omit<StutiVinatiDTO, 'id'>) => {
    let result = null;
    try {
      result = await mutations.create(data as StutiVinatiDTO);
      if (result) {
      success('Prayer created successfully');
      if (onSuccessCallback) onSuccessCallback();
    }
    } catch (err: any) {
      showError(err.message || 'Error occurred');
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<StutiVinatiDTO>) => {
    try {
      await mutations.update(id, data);
      
      success('Prayer updated successfully');
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
      
      success('Prayer deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
        } catch (err: any) {
      showError(err.message || 'Error occurred');
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
