import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../../firebase/config';

export const authRepository = {
  login: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const tokenResult = await userCredential.user.getIdTokenResult(true);
    
    // Check if user has admin claim, developer, or client super admin role
    const claims = tokenResult.claims;
    const isAdmin = claims.admin === true || 
                    claims.role === 'developer_super_admin' || 
                    claims.role === 'client_super_admin';
    const isSuspended = claims.accountStatus === 'suspended';

    if (!isAdmin || isSuspended) {
      await firebaseSignOut(auth);
      throw new Error(isSuspended ? 'Account suspended.' : 'Unauthorized: Admin privileges required.');
    }
    return userCredential;
  },
  logout: async () => {
    return firebaseSignOut(auth);
  },
  
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const tokenResult = await userCredential.user.getIdTokenResult(true);
    
    const claims = tokenResult.claims;
    const isAdmin = claims.admin === true || 
                    claims.role === 'developer_super_admin' || 
                    claims.role === 'client_super_admin';
    const isSuspended = claims.accountStatus === 'suspended';

    if (!isAdmin || isSuspended) {
      await firebaseSignOut(auth);
      throw new Error(isSuspended ? 'Account suspended.' : 'Unauthorized: Admin privileges required.');
    }
    return userCredential;
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          const claims = tokenResult.claims;
          const isAdmin = claims.admin === true || 
                          claims.role === 'developer_super_admin' || 
                          claims.role === 'client_super_admin';
          const isSuspended = claims.accountStatus === 'suspended';

          if (!isAdmin || isSuspended) {
            await firebaseSignOut(auth);
            callback(null);
            return;
          }
        } catch {
          await firebaseSignOut(auth);
          callback(null);
          return;
        }
      }
      callback(user);
    });
  },
  getCurrentUserId: () => {
    return auth.currentUser?.uid || null;
  }
};

