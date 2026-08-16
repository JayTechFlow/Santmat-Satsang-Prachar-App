import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { UserProfile, UserRole, UserAccountStatus } from '../types';

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
    const res = await userService.updateUserRole(targetUid, newRole);
    if (!res.success) setError(res.error || 'Role update failed');
    return res;
  };

  const updateUserStatus = async (targetUid: string, status: UserAccountStatus) => {
    const res = await userService.updateUserStatus(targetUid, status);
    if (!res.success) setError(res.error || 'Status update failed');
    return res;
  };

  return {
    users,
    loading,
    error,
    updateUserRole,
    updateUserStatus
  };
}