import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { categoryService } from '../services/categoryService';
import type { CategoryDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useCategoryMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<CategoryDTO>(categoryService);

  const handleCreate = async (data: Omit<CategoryDTO, 'id'>) => {
    const result = await mutations.create(data as CategoryDTO);
    if (result) {
      success('Category created successfully');
      if (onSuccessCallback) onSuccessCallback();
    } else if (mutations.error) {
      showError(mutations.error.message);
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<CategoryDTO>) => {
    await mutations.update(id, data);
    if (!mutations.error) {
      success('Category updated successfully');
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
      success('Category deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
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
