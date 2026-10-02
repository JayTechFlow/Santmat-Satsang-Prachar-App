import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { UserProfile, UserRole, UserAccountStatus } from '../../../types/common/index';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Track whether we've received initial data
    let hasReceivedInitialData = false;

    const unsubscribe = userService.subscribeUsers(
      (list: UserProfile[]) => {
        setUsers(list);
        hasReceivedInitialData = true;
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'User list failed to load');
        setLoading(false);
      }
    );

    // If we never received data within a reasonable time, stop loading
    const timeoutId = setTimeout(() => {
      if (!hasReceivedInitialData) {
        setLoading(false);
      }
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const updateUserRole = async (targetUid: string, newRole: UserRole) => {
    return userService.updateUserRole(targetUid, newRole);
  };

  const updateUserStatus = async (targetUid: string, status: UserAccountStatus) => {
    return userService.updateUserStatus(targetUid, status);
  };

  const deleteUserPermanently = async (targetUid: string) => {
    return userService.deleteUserPermanently(targetUid);
  };

  const clearError = () => setError(null);

  return {
    users,
    loading,
    error,
    clearError,
    updateUserRole,
    updateUserStatus,
    deleteUserPermanently,
  };
}