import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { BhajanEntity, ServiceResponse } from '../types';

/**
 * Backend contract: admin-panel bhajanRepository targets the `audio` collection.
 * Collection name is the single source of truth shared with production Firestore.
 */
const COLLECTION_NAME = 'audio';

export class BhajanService {
  /**
   * Subscribe to real-time bhajans from the `audio` collection.
   * Empty snapshot -> empty list (real empty state). Errors propagate to onError.
   */
  subscribeBhajans(callback: (bhajans: BhajanEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const list: BhajanEntity[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<BhajanEntity, 'id'>)
          }));
          callback(list);
        },
        (error) => {
          console.warn('Firestore Bhajans Subscription Error:', error);
          if (onError) onError(error);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Firestore query error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  /**
   * Fetch all bhajans once
   */
  async getBhajans(): Promise<ServiceResponse<BhajanEntity[]>> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const data: BhajanEntity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BhajanEntity, 'id'>)
      }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch bhajans' };
    }
  }

  /**
   * Add new bhajan record to Firestore
   */
  async addBhajan(payload: Omit<BhajanEntity, 'id'>): Promise<ServiceResponse<BhajanEntity>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const newBhajan: BhajanEntity = {
        id: docRef.id,
        ...payload
      };
      return { success: true, data: newBhajan };
    } catch (error: any) {
      console.error('Error adding bhajan:', error);
      return { success: false, error: error.message || 'Failed to save bhajan' };
    }
  }

  /**
   * Fetch a single bhajan by id
   */
  async getBhajan(id: string): Promise<ServiceResponse<BhajanEntity | null>> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (!docSnap.exists()) return { success: true, data: null };
      return { success: true, data: { id: docSnap.id, ...(docSnap.data() as Omit<BhajanEntity, 'id'>) } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch bhajan' };
    }
  }

  /**
   * Update existing bhajan record
   */
  async updateBhajan(id: string, updates: Partial<BhajanEntity>): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update bhajan' };
    }
  }

  /**
   * Delete bhajan record
   */
  async deleteBhajan(id: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete bhajan' };
    }
  }
}

export const bhajanService = new BhajanService();
