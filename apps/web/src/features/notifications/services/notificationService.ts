import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../lib/firebase/config';
import { NotificationEntity, ServiceResponse } from '../../../types/common/index';

const COLLECTION_NAME = 'notifications';

export function normalizeNotificationEntity(id: string, data: any): NotificationEntity {
  return {
    id,
    title: String(data.title || '').trim(),
    message: String(data.message || '').trim(),
    date: String(data.date || new Date().toISOString()).trim(),
    type: (data.type === 'suvichar' || data.type === 'bhajan' || data.type === 'stuti' || data.type === 'special' || data.type === 'event') ? data.type : 'special',
    isRead: data.isRead !== undefined ? Boolean(data.isRead) : false,
    targetRole: data.targetRole ? String(data.targetRole) as any : undefined,
  };
}

export class NotificationService {
  /**
   * Subscribe to real-time notification streams.
   * If `uid` is provided, listens to global `notifications` collection AND
   * `users/{uid}/notification_state` subcollection, merging `isRead` and
   * filtering out soft-deleted items (`isDeleted`).
   */
  subscribeNotifications(
    uidOrCallback: string | undefined | ((items: NotificationEntity[]) => void),
    callbackOrOnError?: ((items: NotificationEntity[]) => void) | ((error: Error) => void),
    onError?: (error: Error) => void
  ): () => void {
    let uid: string | undefined;
    let callback: (items: NotificationEntity[]) => void;
    let handleError: ((error: Error) => void) | undefined;

    if (typeof uidOrCallback === 'function') {
      uid = undefined;
      callback = uidOrCallback;
      handleError = callbackOrOnError as ((error: Error) => void) | undefined;
    } else {
      uid = uidOrCallback;
      callback = callbackOrOnError as (items: NotificationEntity[]) => void;
      handleError = onError;
    }

    let globalDocs: Map<string, any> = new Map();
    let stateMap: Map<string, { isRead?: boolean; isDeleted?: boolean }> = new Map();
    let unsubState: (() => void) | null = null;
    let isUnsubscribed = false;

    const emitMergedNotifications = () => {
      if (isUnsubscribed) return;
      const list: NotificationEntity[] = Array.from(globalDocs.entries())
        .filter(([id]) => {
          const st = stateMap.get(id);
          return !(st?.isDeleted === true);
        })
        .map(([id, data]) => {
          const entity = normalizeNotificationEntity(id, data);
          const st = stateMap.get(id);
          return {
            ...entity,
            isRead: st?.isRead !== undefined ? Boolean(st.isRead) : entity.isRead
          };
        });
      callback(list);
    };

    let unsubGlobal: () => void;
    try {
      unsubGlobal = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const map = new Map<string, any>();
          snapshot.docs.forEach((d) => map.set(d.id, d.data()));
          globalDocs = map;
          emitMergedNotifications();
        },
        (err) => {
          console.warn('Notification subscription error:', err);
          if (handleError) handleError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Notification subscription error:', err);
      if (handleError) handleError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }

    if (uid && uid.trim().length > 0) {
      try {
        const stateCollRef = collection(db, 'users', uid.trim(), 'notification_state');
        unsubState = onSnapshot(
          stateCollRef,
          (snapshot) => {
            const map = new Map<string, { isRead?: boolean; isDeleted?: boolean }>();
            snapshot.docs.forEach((d) => {
              const data = d.data();
              map.set(d.id, {
                isRead: data.isRead !== undefined ? Boolean(data.isRead) : undefined,
                isDeleted: data.isDeleted !== undefined ? Boolean(data.isDeleted) : undefined,
              });
            });
            stateMap = map;
            emitMergedNotifications();
          },
          (err) => {
            console.warn('User notification_state subscription error:', err);
          }
        );
      } catch (err) {
        console.warn('User notification_state subscription init error:', err);
      }
    }

    return () => {
      isUnsubscribed = true;
      if (unsubGlobal) unsubGlobal();
      if (unsubState) unsubState();
    };
  }

  /**
   * Persist the notification record in `notifications` (omitting `isRead`),
   * then broadcast push via callable.
   */
  async addNotification(item: Omit<NotificationEntity, 'id' | 'isRead'> & { isRead?: boolean }): Promise<ServiceResponse<NotificationEntity>> {
    try {
      const { isRead: _ignoredIsRead, ...itemData } = item as any;
      const payload: Record<string, any> = {
        title: itemData.title || '',
        message: itemData.message || '',
        type: itemData.type || 'special',
        date: itemData.date || new Date().toISOString(),
      };
      if (itemData.targetRole) {
        payload.targetRole = itemData.targetRole;
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

      try {
        const broadcastFn = httpsCallable(functions, 'notifications-broadcast');
        await broadcastFn({
          title: item.title,
          body: item.message,
          topic: 'all_users',
          payload: { type: item.type }
        });
        return { success: true, data: normalizeNotificationEntity(docRef.id, payload) };
      } catch (broadcastErr: any) {
        console.warn('Push broadcast failed (record saved):', broadcastErr);
        return {
          success: true,
          data: normalizeNotificationEntity(docRef.id, payload),
          message: 'सूचना सहेज ली गई, परंतु पुश ब्रॉडकास्ट विफल रहा: ' + (broadcastErr.message || 'Unknown broadcast error')
        };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send notification' };
    }
  }

  /**
   * Persist read state for user in `users/{uid}/notification_state/{id}`
   */
  async markAsRead(id: string, uid: string): Promise<ServiceResponse<void>> {
    if (!uid || !uid.trim()) {
      return { success: false, error: 'User ID is required to mark notification as read' };
    }
    if (!id || !id.trim()) {
      return { success: false, error: 'Notification ID is required' };
    }
    try {
      const stateRef = doc(db, 'users', uid.trim(), 'notification_state', id.trim());
      await setDoc(stateRef, { isRead: true, readAt: serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message || 'Failed to mark notification as read' };
    }
  }

  /**
   * Persist read state for user across multiple notifications using batch write
   */
  async markAllAsRead(uid: string, notificationIds: string[]): Promise<ServiceResponse<void>> {
    if (!uid || !uid.trim()) {
      return { success: false, error: 'User ID is required to mark notifications as read' };
    }
    if (!notificationIds || notificationIds.length === 0) {
      return { success: true };
    }
    try {
      const batch = writeBatch(db);
      for (const id of notificationIds) {
        if (!id || !id.trim()) continue;
        const ref = doc(db, 'users', uid.trim(), 'notification_state', id.trim());
        batch.set(ref, { isRead: true, readAt: serverTimestamp() }, { merge: true });
      }
      await batch.commit();
      return { success: true };
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false, error: error.message || 'Failed to mark all notifications as read' };
    }
  }

  async deleteNotification(id: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete notification' };
    }
  }
}

export const notificationService = new NotificationService();
