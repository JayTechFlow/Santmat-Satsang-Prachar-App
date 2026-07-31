import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { categoryService } from '../services/categoryService';
import type { CategoryDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useCategoryMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<CategoryDTO>(categoryService);

  const handleCreate = async (data: Omit<CategoryDTO, 'id'>) => {
    let result = null;
    try {
      result = await mutations.create(data as CategoryDTO);
      if (result) {
      success('Category created successfully');
      if (onSuccessCallback) onSuccessCallback();
    }
    } catch (err: any) {
      showError(err.message || 'Error occurred');
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<CategoryDTO>) => {
    try {
      await mutations.update(id, data);
      
      success('Category updated successfully');
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
      
      success('Category deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
        } catch (err: any) {
      showError(err.message || 'Error occurred');
      return false;
    }
  };
  
  const handleArchive = async (id: string, archive: boolean) => {
    await handleUpdate(id, { status: archive ? 'archived' : 'active' });
  };

  return {
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
    archiveCategory: handleArchive,
    loading: mutations.loading,
    error: mutations.error,
  };
}
