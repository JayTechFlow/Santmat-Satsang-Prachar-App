import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import { NotificationEntity, ServiceResponse } from '../types';

const COLLECTION_NAME = 'notifications';

export class NotificationService {
  subscribeNotifications(callback: (items: NotificationEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: NotificationEntity[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<NotificationEntity, 'id'>)
          }));
          callback(list);
        },
        (err) => {
          console.warn('Notification subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Notification subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  /**
   * Persist the notification record, then broadcast a push via the secure
   * `notifications-broadcast` callable (requires admin, sends to the
   * `all_users` FCM topic). A broadcast failure keeps the saved record but is
   * surfaced in the response message so the admin sees the delivery status.
   */
  async addNotification(item: Omit<NotificationEntity, 'id'>): Promise<ServiceResponse<NotificationEntity>> {
    try {
      const payload = {
        ...item,
        date: item.date || new Date().toISOString(),
        isRead: false
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

      try {
        const broadcastFn = httpsCallable(functions, 'notifications-broadcast');
        await broadcastFn({
          title: item.title,
          body: item.message,
          topic: 'all_users',
          payload: { type: item.type }
        });
        return { success: true, data: { id: docRef.id, ...payload } };
      } catch (broadcastErr: any) {
        console.warn('Push broadcast failed (record saved):', broadcastErr);
        return {
          success: true,
          data: { id: docRef.id, ...payload },
          message: 'सूचना सहेज ली गई, परंतु पुश ब्रॉडकास्ट विफल रहा: ' + (broadcastErr.message || 'Unknown broadcast error')
        };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send notification' };
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
