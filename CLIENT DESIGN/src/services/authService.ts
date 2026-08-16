import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, UserRole, ServiceResponse } from '../types';

/**
 * Admin claim-gating contract (ported from admin-panel authRepository).
 * An account may enter the admin portal only when the ID token carries an
 * admin claim (`admin === true`) or a super-admin role claim, and the account
 * is not suspended. Non-admin / suspended sessions are signed out immediately.
 */
const isAdminAllowed = (claims: Record<string, unknown>): { allowed: boolean; suspended: boolean } => {
  const isAdmin =
    claims.admin === true ||
    claims.role === 'developer_super_admin' ||
    claims.role === 'client_super_admin';
  const suspended = claims.accountStatus === 'suspended';
  return { allowed: isAdmin && !suspended, suspended };
};

export class AuthService {
  /**
   * Listen to Firebase Auth state change and fetch custom claims & Firestore user profile.
   * Non-admin or suspended sessions are signed out and reported as null.
   */
  onAuthState(callback: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const claims = idTokenResult.claims;
        const { allowed, suspended } = isAdminAllowed(claims);

        if (!allowed) {
          await firebaseSignOut(auth);
          callback(null);
          return;
        }

        const role = (claims.role as UserRole) || 'mobile_user';
        const organizationId = (claims.organizationId as string) || 'default_org';

        // Fetch user document from Firestore users collection
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        let profileData: Partial<UserProfile> = {};
        if (userSnap.exists()) {
          profileData = userSnap.data() as Partial<UserProfile>;
        }

        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || profileData.displayName || 'Devotee User',
          photoURL: firebaseUser.photoURL || profileData.photoURL || '',
          role,
          organizationId,
          accountStatus: (claims.accountStatus as UserProfile['accountStatus']) || profileData.accountStatus || (suspended ? 'suspended' : 'active'),
          phone: profileData.phone || '',
          city: profileData.city || '',
          spiritualMotto: profileData.spiritualMotto || '',
          guruDiksha: profileData.guruDiksha || '',
          dikshaGuru: profileData.dikshaGuru || '',
          createdAt: profileData.createdAt || new Date().toISOString()
        };

        callback(userProfile);
      } catch (error) {
        console.error('Error resolving user auth profile:', error);
        try {
          await firebaseSignOut(auth);
        } catch {
          /* ignore sign-out failure */
        }
        callback(null);
      }
    });
  }

  /**
   * Firebase Auth Sign In (email/password) with admin claim-gating.
   * Rejects non-admin and suspended accounts after signing them out.
   */
  async login(email: string, pass: string): Promise<ServiceResponse<UserProfile>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = idTokenResult.claims;
      const { allowed, suspended } = isAdminAllowed(claims);

      if (!allowed) {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: suspended ? 'Account suspended.' : 'Unauthorized: Admin privileges required.'
        };
      }

      const role = (claims.role as UserRole) || 'mobile_user';
      const organizationId = (claims.organizationId as string) || 'default_org';

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role,
        organizationId,
        accountStatus: 'active'
      };

      return { success: true, data: userProfile };
    } catch (error: any) {
      console.error('Login Error:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  /**
   * Current signed-in Firebase user id (admin-gated sessions only).
   */
  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Sign Out
   */
  async logout(): Promise<ServiceResponse<void>> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Logout failed' };
    }
  }

  /**
   * Password Reset
   */
  async resetPassword(email: string): Promise<ServiceResponse<void>> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset link sent to email' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset request failed' };
    }
  }
}

export const authService = new AuthService();
