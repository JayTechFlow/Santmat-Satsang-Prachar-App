import { useState } from 'react';
import { BaseCrudService } from '../services/BaseCrudService';
import { AppError } from '../errors/AppError';

export function useCrudMutations<T extends { id: string }>(service: BaseCrudService<T>) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  // Optional progress could be used for file uploads if mutation includes storage,
  // but for standard CRUD we can just set it 0 to 100.
  const [progress, setProgress] = useState<number>(0);

  const executeMutation = async <R>(mutationFn: () => Promise<R>): Promise<R | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    try {
      // Basic progress for standard CRUD operations (starts at 50, ends at 100)
      setProgress(50);
      const result = await mutationFn();
      setProgress(100);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err as AppError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createItem = (item: T, customId?: string) => executeMutation(() => service.create(item, customId));
  
  const updateItem = (id: string, item: Partial<T>) => executeMutation(() => service.update(id, item));
  
  const deleteItem = (id: string) => executeMutation(() => service.delete(id));

  return {
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    loading,
    progress,
    success,
    error,
  };
}
