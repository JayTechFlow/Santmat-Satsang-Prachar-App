import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { notificationService } from '../services/notificationService';
import type { NotificationDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useNotificationMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<NotificationDTO>(notificationService);

  const handleCreate = async (data: Omit<NotificationDTO, 'id'>) => {
    let result = null;
    try {
      result = await mutations.create(data as NotificationDTO);
      if (result) {
      success('Notification created successfully');
      if (onSuccessCallback) onSuccessCallback();
    }
    } catch (err: any) {
      showError(err.message || 'Error occurred');
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<NotificationDTO>) => {
    try {
      await mutations.update(id, data);
      
      success('Notification updated successfully');
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
      
      success('Notification deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
        } catch (err: any) {
      showError(err.message || 'Error occurred');
      return false;
    }
  };

  const handleSend = async (id: string) => {
    // In a real app this might trigger a Cloud Function.
    // For now, we just update the status.
    await handleUpdate(id, { pushStatus: 'sent' });
  };

  return {
    createNotification: handleCreate,
    updateNotification: handleUpdate,
    deleteNotification: handleDelete,
    sendNotification: handleSend,
    loading: mutations.loading,
    error: mutations.error,
  };
}
