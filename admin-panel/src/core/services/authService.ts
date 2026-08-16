import { authRepository } from '../repositories/authRepository';
import type { User } from 'firebase/auth';

export const authService = {
  login: async (email: string, password: string) => {
    return authRepository.login(email, password);
  },
  signInWithGoogle: async () => {
    return authRepository.signInWithGoogle();
  },
  logout: async () => {
    return authRepository.logout();
  },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return authRepository.onAuthStateChanged(callback);
  },
  getCurrentUserId: () => {
    return authRepository.getCurrentUserId();
  }
};
