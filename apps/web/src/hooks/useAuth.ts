import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserProfile, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const res = await authService.login(email, pass);
    setLoading(false);
    return res;
  };

  const logout = async () => {
    setLoading(true);
    const res = await authService.logout();
    setLoading(false);
    return res;
  };

  const isSuperAdmin = user?.role === 'developer_super_admin';
  const isClientAdmin = user?.role === 'client_super_admin' || isSuperAdmin;
  const isMobileUser = user?.role === 'mobile_user';

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'developer_super_admin') return true;
    if (user.role === 'client_super_admin' && requiredRole !== 'developer_super_admin') return true;
    return user.role === requiredRole;
  };

  return {
    user,
    loading,
    login,
    logout,
    isSuperAdmin,
    isClientAdmin,
    isMobileUser,
    hasPermission
  };
}
