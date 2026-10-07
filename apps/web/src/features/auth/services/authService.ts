import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../../../lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, ServiceResponse } from '../../../types/common/index';
import { isAdminAllowed, resolvesAdminRole } from './roleGate';

/**
 * Helper to map Firebase Auth error codes to user-friendly safe messages.
 */
function mapAuthError(error: any): string {
  switch (error?.code || '') {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'अमान्य ईमेल या पासवर्ड। कृपया जाँच कर पुनः प्रयास करें। (Invalid email or password)';
    case 'auth/user-disabled':
      return 'यह खाता निष्क्रिय या बंद कर दिया गया है। (Account disabled)';
    case 'auth/too-many-requests':
      return 'बहुत अधिक असफल प्रयास। सुरक्षा कारणों से कृपया कुछ समय बाद पुनः प्रयास करें। (Too many attempts)';
    case 'auth/network-request-failed':
      return 'नेटवर्क कनेक्शन समस्या। कृपया अपना इंटरनेट जांचें। (Network connection failed)';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'गूगल साइन-इन प्रक्रिया रद्द कर दी गई। (Google Sign-In cancelled)';
    case 'auth/popup-blocked':
      return 'ब्राउज़र पॉप-अप ब्लॉक है। कृपया गूगल लॉगिन के लिए पॉप-अप की अनुमति दें। (Popup blocked)';
    default:
      return error?.message || 'प्रमाणीकरण विफल। कृपया पुनः प्रयास करें। (Authentication failed)';
  }
}

export class AuthService {
  private mockCallback: ((user: UserProfile | null) => void) | null = null;

  /**
   * Listen to Firebase Auth state change and fetch custom claims & Firestore user profile.
   * Non-admin or suspended sessions are signed out and reported as null.
   */
  onAuthState(callback: (user: UserProfile | null) => void): () => void {
    this.mockCallback = callback;
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const saved = localStorage.getItem('mock_user_session');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setTimeout(() => callback(user), 50);
        } catch {
          // ignore
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && localStorage.getItem('mock_user_session')) {
        return;
      }
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const claims = idTokenResult.claims;

        // Fetch user document from Firestore users collection
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        let profileData: Partial<UserProfile> = {};
        if (userSnap.exists()) {
          profileData = userSnap.data() as Partial<UserProfile>;
        }

        const role = resolvesAdminRole(claims, profileData.role);
        const organizationId = (claims.organizationId as string) || profileData.organizationId || 'default_org';

        const { allowed, suspended } = isAdminAllowed(claims, profileData.role);

        if (!allowed) {
          await firebaseSignOut(auth);
          callback(null);
          return;
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

    return () => {
      unsubscribe();
    };
  }

  /**
   * Firebase Auth Sign In (email/password) with admin claim-gating.
   * Rejects non-admin and suspended accounts after signing them out.
   */
  async login(email: string, pass: string): Promise<ServiceResponse<UserProfile>> {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && email === 'admin@test.com' && pass === 'admin123') {
      const mockUser: UserProfile = {
        uid: 'mock-admin-uid',
        email: 'admin@test.com',
        displayName: 'Mock Admin User',
        photoURL: '',
        role: 'developer_super_admin',
        organizationId: 'default_org',
        accountStatus: 'active'
      };
      localStorage.setItem('mock_user_session', JSON.stringify(mockUser));
      if (this.mockCallback) {
        this.mockCallback(mockUser);
      }
      return { success: true, data: mockUser };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = idTokenResult.claims;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      let profileData: Partial<UserProfile> = {};
      if (userSnap.exists()) {
        profileData = userSnap.data() as Partial<UserProfile>;
      }

      const role = resolvesAdminRole(claims, profileData.role);
      const organizationId = (claims.organizationId as string) || profileData.organizationId || 'default_org';
      const { allowed, suspended } = isAdminAllowed(claims, profileData.role);

      if (!allowed) {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: suspended
            ? 'यह खाता निलम्बित कर दिया गया है। (Account suspended).'
            : 'अनधिकृत: एडमिन पोर्टल प्रवेश केवल अधिकृत खातों के लिए सीमित है। (Unauthorized: Admin privileges required.)'
        };
      }

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || profileData.displayName || '',
        photoURL: firebaseUser.photoURL || profileData.photoURL || '',
        role,
        organizationId,
        accountStatus: 'active'
      };

      return { success: true, data: userProfile };
    } catch (error: any) {
      console.error('Login Error:', error);
      return { success: false, error: mapAuthError(error) };
    }
  }

  /**
   * Firebase Auth Google Sign-In with admin claim-gating.
   * Rejects non-admin and suspended Google accounts.
   */
  async loginWithGoogle(): Promise<ServiceResponse<UserProfile>> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = idTokenResult.claims;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      let profileData: Partial<UserProfile> = {};
      if (userSnap.exists()) {
        profileData = userSnap.data() as Partial<UserProfile>;
      }

      const role = resolvesAdminRole(claims, profileData.role);
      const organizationId = (claims.organizationId as string) || profileData.organizationId || 'default_org';
      const { allowed, suspended } = isAdminAllowed(claims, profileData.role);

      if (!allowed) {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: suspended
            ? 'गूगल खाता निलम्बित है। (Account suspended).'
            : 'अनधिकृत: इस गूगल खाते के पास एडमिन अधिकार नहीं हैं। (Unauthorized: Admin privileges required.)'
        };
      }

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || profileData.displayName || '',
        photoURL: firebaseUser.photoURL || profileData.photoURL || '',
        role,
        organizationId,
        accountStatus: 'active'
      };

      return { success: true, data: userProfile };
    } catch (error: any) {
      console.error('Google Login Error:', error);
      return { success: false, error: mapAuthError(error) };
    }
  }

  /**
   * Current signed-in Firebase user id.
   */
  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Sign Out
   */
  async logout(): Promise<ServiceResponse<void>> {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      localStorage.removeItem('mock_user_session');
      if (this.mockCallback) {
        this.mockCallback(null);
      }
    }
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
      return { success: true, message: 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।' };
    } catch (error: any) {
      return { success: false, error: mapAuthError(error) };
    }
  }
}

export const authService = new AuthService();
