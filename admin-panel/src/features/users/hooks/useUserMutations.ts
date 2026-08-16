import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { userService } from '../services/userService';
import type { UserDTO, UserStatus } from '../types';
import { useToast } from '../../../hooks/useToast';
import { getAuth } from 'firebase/auth';

export function useUserMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<UserDTO>(userService);

  const refreshUserToken = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.getIdToken(true); // Force token refresh
      }
    } catch (e) {
      console.warn('Failed to refresh user token after role change', e);
    }
  };

  const handleCreate = async (data: Omit<UserDTO, 'id'>) => {
    // Note: Creating an admin user via client-side usually requires Cloud Functions or secondary auth app.
    // For this prototype, we store in Firestore.
    let result = null;
    try {
      result = await mutations.create(data as UserDTO);
      if (result) {
        success('User profile created successfully');
        if (onSuccessCallback) onSuccessCallback();
      }
    } catch (err: any) {
      showError(err.message || 'Error occurred');
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<UserDTO>) => {
    try {
      await mutations.update(id, data);
      
      // Force token refresh if role was changed
      if (data.roleIds) {
        await refreshUserToken();
      }
      
      success('User updated successfully');
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
      
      success('User deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } catch (err: any) {
      showError(err.message || 'Error occurred');
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
