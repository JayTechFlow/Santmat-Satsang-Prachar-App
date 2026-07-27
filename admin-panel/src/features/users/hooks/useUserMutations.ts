import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { userService } from '../services/userService';
import type { UserDTO, UserStatus } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useUserMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<UserDTO>(userService);

  const handleCreate = async (data: Omit<UserDTO, 'id'>) => {
    // Note: Creating an admin user via client-side usually requires Cloud Functions or secondary auth app.
    // For this prototype, we store in Firestore.
    const result = await mutations.create(data as UserDTO);
    if (result) {
      success('User profile created successfully');
      if (onSuccessCallback) onSuccessCallback();
    } else if (mutations.error) {
      showError(mutations.error.message);
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<UserDTO>) => {
    await mutations.update(id, data);
    if (!mutations.error) {
      success('User updated successfully');
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
      success('User deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
      return false;
    }
  };

  const handleStatusChange = async (id: string, status: UserStatus) => {
    await handleUpdate(id, { status });
  };
  
  const handleAssignRole = async (id: string, roleIds: string[]) => {
    await handleUpdate(id, { roleIds });
  };

  return {
    createUser: handleCreate,
    updateUser: handleUpdate,
    deleteUser: handleDelete,
    changeStatus: handleStatusChange,
    assignRole: handleAssignRole,
    loading: mutations.loading,
    error: mutations.error,
  };
}
