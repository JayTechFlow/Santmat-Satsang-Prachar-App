import {
  collection,
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import { UserProfile, UserRole, UserAccountStatus, ServiceResponse } from '../types';

const COLLECTION_NAME = 'users';

export class UserService {
  /**
   * Subscribe to the devotee/user list in Firestore (`users` collection).
   */
  subscribeUsers(callback: (users: UserProfile[]) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: UserProfile[] = snapshot.docs.map((d) => ({
            uid: d.id,
            ...(d.data() as Omit<UserProfile, 'uid'>)
          }));
          callback(list);
        },
        (err) => {
          console.warn('User subscription error:', err);
          callback([]);
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
   * Create a new auth user. NOT AVAILABLE from the browser: no public callable
   * exists for this (the backend Admin SDK `bootstrap` endpoint is permanently
   * disabled for zero-attack-surface). Returns an explicit error instead of
   * fabricating a user. Provision accounts offline via the Admin SDK CLI.
   */
  async createUser(_payload: {
    email: string;
    password?: string;
    displayName: string;
    role: UserRole;
    organizationId?: string;
  }): Promise<ServiceResponse<{ uid: string }>> {
    return {
      success: false,
      error: 'User provisioning requires backend Admin SDK privileges and is not available from the admin portal. Create accounts offline via the Admin SDK CLI.'
    };
  }
}

export const userService = new UserService();
