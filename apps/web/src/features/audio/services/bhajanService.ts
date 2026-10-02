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
import { db } from '../../../lib/firebase/config';
import { BhajanEntity, ServiceResponse } from '../../../types/common/index';

export function normalizeBhajanEntity(id: string, data: any): BhajanEntity {
  return {
    id,
    title: String(data.title || '').trim(),
    artist: String(data.artist || '').trim(),
    category: String(data.category || '').trim(),
    subCategory: data.subCategory ? String(data.subCategory).trim() : undefined,
    duration: String(data.duration || '00:00').trim(),
    durationSeconds: Number(data.durationSeconds || 0),
    audioUrl: data.audioUrl ? String(data.audioUrl).trim() : undefined,
    storagePath: data.storagePath ? String(data.storagePath).trim() : undefined,
    imageUrl: String(data.imageUrl || '').trim(),
    plays: Number(data.plays || 0),
    addedDate: String(data.addedDate || '').trim(),
    lyrics: data.lyrics ? String(data.lyrics).trim() : undefined,
    isFavorite: Boolean(data.isFavorite),
    type: data.type || 'भजन',
    language: data.language ? String(data.language).trim() : undefined,
    status: data.status || 'प्रकाशित',
    scheduledDate: data.scheduledDate ? String(data.scheduledDate).trim() : undefined,
    scheduledTime: data.scheduledTime ? String(data.scheduledTime).trim() : undefined,
    organizationId: data.organizationId ? String(data.organizationId).trim() : undefined,
    createdBy: data.createdBy ? String(data.createdBy).trim() : undefined,
  };
}

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
          const list: BhajanEntity[] = snapshot.docs.map((d) => normalizeBhajanEntity(d.id, d.data()));
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
      const data: BhajanEntity[] = snap.docs.map((d) => normalizeBhajanEntity(d.id, d.data()));
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
      return { success: true, data: normalizeBhajanEntity(docSnap.id, docSnap.data()) };
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
