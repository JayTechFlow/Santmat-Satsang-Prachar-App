import { authService } from '../core/services/authService';
import { useState } from 'react';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError('');
      return await authService.login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      return await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    return authService.logout();
  };

  return {
    login,
    signInWithGoogle,
    logout,
    loading,
    error,
    setError
  };
}
