import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { SuvicharEntity, ServiceResponse } from '../../types/common/index';

const COLLECTION_NAME = 'suvichar';

export function normalizeSuvicharEntity(id: string, data: any): SuvicharEntity {
  return {
    id,
    title: data.title ? String(data.title).trim() : undefined,
    quote: String(data.quote || data.content || '').trim(),
    author: String(data.author || 'संत वाणी').trim(),
    theme: String(data.theme || 'सत्संग विचार').trim(),
    imageUrl: data.imageUrl ? String(data.imageUrl).trim() : undefined,
    date: data.date ? String(data.date).trim() : undefined,
    isSpecialPoster: data.isSpecialPoster !== undefined ? Boolean(data.isSpecialPoster) : undefined,
  };
}

export class SuvicharService {
  async getSuvichars(): Promise<SuvicharEntity[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map(d => normalizeSuvicharEntity(d.id, d.data()));
    } catch {
      return [];
    }
  }

  subscribeSuvichars(callback: (items: SuvicharEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: SuvicharEntity[] = snapshot.docs.map((d) => normalizeSuvicharEntity(d.id, d.data()));
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
