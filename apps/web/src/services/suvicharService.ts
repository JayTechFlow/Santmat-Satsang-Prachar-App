import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SuvicharEntity, ServiceResponse } from '../types';

const COLLECTION_NAME = 'suvichar';

export class SuvicharService {
  async getSuvichars(): Promise<SuvicharEntity[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SuvicharEntity, 'id'>) }));
    } catch {
      return [];
    }
  }

  subscribeSuvichars(callback: (items: SuvicharEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: SuvicharEntity[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SuvicharEntity, 'id'>)
          }));
          callback(list);
        },
        (err) => {
          console.warn('Suvichar subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Suvichar subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  async addSuvichar(item: Omit<SuvicharEntity, 'id'>): Promise<ServiceResponse<SuvicharEntity>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
      return { success: true, data: { id: docRef.id, ...item } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add suvichar' };
    }
  }

  async updateSuvichar(id: string, updates: Partial<SuvicharEntity>): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update suvichar' };
    }
  }

  async deleteSuvichar(id: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete suvichar' };
    }
  }
}

export const suvicharService = new SuvicharService();
