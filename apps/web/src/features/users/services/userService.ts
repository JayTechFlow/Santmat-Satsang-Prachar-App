import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  limit
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../lib/firebase/config';
import { UserProfile, UserRole, UserAccountStatus, ServiceResponse } from '../../../types/common/index';

const COLLECTION_NAME = 'users';

function parseFirebaseDate(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch (_) {
      return undefined;
    }
  }
  if (val.seconds !== undefined) {
    return new Date(val.seconds * 1000).toISOString();
  }
  if (typeof val === 'string') {
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  return undefined;
}

export class UserService {
  /**
   * Subscribe to the devotee/user list in Firestore (`users` collection).
   */
  subscribeUsers(callback: (users: UserProfile[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: UserProfile[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              uid: d.id,
              email: data.email || '',
              displayName: data.displayName || data.name || '',
              photoURL: data.photoURL || '',
              role: data.role || 'mobile_user',
              organizationId: data.organizationId || '',
              accountStatus: data.accountStatus || data.status || 'active',
              phone: data.phone || '',
              city: data.city || '',
              spiritualMotto: data.spiritualMotto || '',
              guruDiksha: data.guruDiksha || '',
              dikshaGuru: data.dikshaGuru || '',
              createdAt: parseFirebaseDate(data.createdAt),
              updatedAt: parseFirebaseDate(data.updatedAt)
            };
          });
          callback(list);
        },
        (err) => {
          console.warn('User subscription error:', err);
          if (onError) {
            const errorMessage = err instanceof Error ? err.message : String((err as any)?.message || err || 'User subscription failed');
            onError(new Error(errorMessage));
          } else {
            callback([]);
          }
        }
      );
    } catch {
      callback([]);
      return () => {};
    }
  }

  /**
   * Update a user's role via the secure `iam-setUserRole` callable.
   * The backend validates privilege hierarchy, blocks self-promotion, writes
   * `role`/`roleIds` to the `users` document, and revokes refresh tokens when needed.
   */
  async updateUserRole(targetUid: string, newRole: UserRole): Promise<ServiceResponse<void>> {
    try {
      const setUserRoleFn = httpsCallable(functions, 'iam-setUserRole');
      await setUserRoleFn({ targetUid, newRole });
      return { success: true };
    } catch (error: any) {
      console.error('updateUserRole Cloud Function Error:', error);
      return { success: false, error: error.message || 'Failed to update user role' };
    }
  }

  /**
   * Update a user's account status by writing the `status` field to `users/{uid}`.
   * The `syncUserCustomClaims` Firestore trigger picks up the change, updates the
   * `accountStatus` claim, and revokes refresh tokens when an account is suspended.
   */
  async updateUserStatus(targetUid: string, status: UserAccountStatus): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, targetUid);
      await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update user account status' };
    }
  }

  /**
   * Create a new user account from the admin dashboard.
   * Flow: Admin UI → secure callable → Firebase Admin Auth createUser → Firestore /users/{uid} → custom claims → audit log → safe summary.
   * The response MUST NOT contain: password, temporary secret, service credentials, Admin SDK internals.
   */
  async createUser(payload: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
    phone?: string;
    role: UserRole;
    initialStatus?: UserAccountStatus;
  }): Promise<ServiceResponse<{ uid: string; email: string; displayName: string; role: UserRole; accountStatus: UserAccountStatus; createdAt: string }>> {
    // Validate password confirmation
    if (payload.password !== payload.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    // Validate minimum password length
    if (payload.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const createUserFn = httpsCallable(functions, 'userProv-createUser');
      const response = await createUserFn({
        email: payload.email,
        password: payload.password,
        displayName: payload.displayName,
        role: payload.role,
        phone: payload.phone,
        initialStatus: payload.initialStatus,
      } as any);

      if (!response.data || typeof response.data !== 'object') {
        return { success: false, error: 'Unexpected response from user provisioning service.' };
      }

      const safeData = response.data as {
        uid: string;
        email: string;
        displayName: string;
        role: UserRole;
        accountStatus: UserAccountStatus;
        createdAt: string;
      };
      const { uid, email: resEmail, displayName: resDisplayName, role: resRole, accountStatus: resStatus, createdAt } = safeData;

      return {
        success: true,
        data: {
          uid,
          email: resEmail || payload.email,
          displayName: resDisplayName || payload.displayName,
          role: resRole || payload.role,
          accountStatus: resStatus || (payload.initialStatus || 'active'),
          createdAt,
        }
      };
    } catch (error: any) {
      console.error('createUser Cloud Function Error:', error);
      const code = error?.code || '';
      if (code === 'auth/email-already-exists') {
        return { success: false, error: 'An account with this email already exists.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'The email address is not valid.' };
      }
      if (code === 'auth/weak-password') {
        return { success: false, error: 'The password is too weak.' };
      }
      return { success: false, error: error.message || 'Failed to create user account.' };
    }
  }

  /**
   * Update non-privileged profile information for a user.
   */
  async updateUserProfile(
    targetUid: string,
    profileUpdates: Partial<Pick<UserProfile, 'displayName' | 'phone' | 'city' | 'spiritualMotto' | 'guruDiksha' | 'dikshaGuru'>>
  ): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, targetUid);
      await updateDoc(docRef, {
        ...profileUpdates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('updateUserProfile Error:', error);
      return { success: false, error: error.message || 'Failed to update user profile.' };
    }
  }

  /**
   * Fetch recent audit trail entries for a target user.
   */
  async getUserAuditLogs(targetUid: string): Promise<ServiceResponse<any[]>> {
    try {
      const auditRef = collection(db, 'audit_logs');
      // Query records where targetUid is in details
      const snapshot = await getDocs(query(auditRef, where('details.targetUid', '==', targetUid), limit(25)));
      const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort in-memory by timestamp desc
      logs.sort((a: any, b: any) => {
        const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || 0).getTime();
        const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || 0).getTime();
        return tB - tA;
      });
      return { success: true, data: logs };
    } catch (error: any) {
      console.warn('getUserAuditLogs (read might require developer privileges):', error?.message);
      return { success: true, data: [] };
    }
  }

  /**
   * Get reconciled directory list (Auth + Firestore comparison)
   */
  async reconcileUserDirectory(): Promise<ServiceResponse<any[]>> {
    try {
      const reconcileFn = httpsCallable(functions, 'userProv-reconcileUserDirectory');
      const res = await reconcileFn();
      return { success: true, data: (res.data as any).data || [] };
    } catch (error: any) {
      console.error('reconcileUserDirectory Error:', error);
      return { success: false, error: error.message || 'Reconciliation failed' };
    }
  }

  /**
   * Clean up Firestore-only orphan profile recursively
   */
  async cleanupOrphanProfile(targetUid: string): Promise<ServiceResponse<void>> {
    try {
      const cleanupFn = httpsCallable(functions, 'userProv-cleanupOrphanProfile');
      await cleanupFn({ targetUid });
      return { success: true };
    } catch (error: any) {
      console.error('cleanupOrphanProfile Error:', error);
      return { success: false, error: error.message || 'Cleanup failed' };
    }
  }

  /**
   * Phase 10 — Permanently delete a user account and all associated resources.
   * DEVELOPER SUPER ADMIN ONLY.
   * Calls secure Cloud Function `userProv-deleteUserPermanently`.
   */
  async deleteUserPermanently(targetUid: string): Promise<ServiceResponse<{
    status: 'FULL_DELETE_SUCCESS' | 'PARTIAL_DELETE_REQUIRES_REVIEW';
    targetUid: string;
    deletedResources: string[];
    failedResources: { resource: string; error: string }[];
    message: string;
  }>> {
    try {
      const deleteFn = httpsCallable(functions, 'userProv-deleteUserPermanently');
      const res = await deleteFn({ targetUid });
      const resultData = res.data as any;
      return {
        success: true,
        data: resultData,
      };
    } catch (error: any) {
      console.error('deleteUserPermanently Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to permanently delete user account.',
      };
    }
  }
}

export const userService = new UserService();
