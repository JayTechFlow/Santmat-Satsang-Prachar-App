import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { StutiEntity, ServiceResponse } from '../types';

/**
 * Backend contract: admin-panel stutiVinatiRepository targets the `stuti_vinati` collection.
 */
const COLLECTION_NAME = 'stuti_vinati';

export class StutiService {
  /**
   * Subscribe to stuti collection. Empty snapshot -> empty list; errors propagate.
   */
  subscribeStuti(callback: (stutis: StutiEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, COLLECTION_NAME), orderBy('type', 'asc')),
        (snapshot) => {
          const list: StutiEntity[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<StutiEntity, 'id'>)
          }));
          callback(list);
        },
        (err) => {
          console.warn('Stuti subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Stuti subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  async getStutis(): Promise<ServiceResponse<StutiEntity[]>> {
    try {
      const snap = await getDocs(query(collection(db, COLLECTION_NAME), orderBy('type', 'asc')));
      const data: StutiEntity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<StutiEntity, 'id'>)
      }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch stuti' };
    }
  }

  /**
   * Update stuti record
   */
  async updateStuti(id: string, updates: Partial<StutiEntity>): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update stuti' };
    }
  }

  /**
   * Create a stuti record
   */
  async createStuti(item: Omit<StutiEntity, 'id'>): Promise<ServiceResponse<StutiEntity>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
      return { success: true, data: { id: docRef.id, ...item } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create stuti' };
    }
  }
}

export const stutiService = new StutiService();
