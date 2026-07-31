import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { bookService } from '../services/bookService';
import type { BookDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useBookMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<BookDTO>(bookService);

  const handleCreate = async (data: Omit<BookDTO, 'id'>) => {
    let result = null;
    try {
      result = await mutations.create(data as BookDTO);
      if (result) {
      success('Book created successfully');
      if (onSuccessCallback) onSuccessCallback();
    }
    } catch (err: any) {
      showError(err.message || 'Error occurred');
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<BookDTO>) => {
    try {
      await mutations.update(id, data);
      
      success('Book updated successfully');
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
      
      success('Book deleted successfully');
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
    createBook: handleCreate,
    updateBook: handleUpdate,
    deleteBook: handleDelete,
    archiveBook: handleArchive,
    assignCategory: handleAssignCategory,
    loading: mutations.loading,
    error: mutations.error,
  };
}
