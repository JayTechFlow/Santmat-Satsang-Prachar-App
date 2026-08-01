import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../../firebase/config';

export const authRepository = {
  login: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  logout: async () => {
    return firebaseSignOut(auth);
  },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
  },
  getCurrentUserId: () => {
    return auth.currentUser?.uid || null;
  }
};
