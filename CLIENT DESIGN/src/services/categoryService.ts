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
import { CategoryEntity, ServiceResponse } from '../types';

const COLLECTION_NAME = 'categories';

export class CategoryService {
  async getCategories(): Promise<CategoryEntity[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<CategoryEntity, 'id'>) }));
    } catch {
      return [];
    }
  }

  subscribeCategories(callback: (items: CategoryEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const list: CategoryEntity[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CategoryEntity, 'id'>)
          }));
          callback(list);
        },
        (err) => {
          console.warn('Category subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Category subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  async addCategory(item: Omit<CategoryEntity, 'id'>): Promise<ServiceResponse<CategoryEntity>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
      return { success: true, data: { id: docRef.id, ...item } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add category' };
    }
  }

  async updateCategory(id: string, updates: Partial<CategoryEntity>): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update category' };
    }
  }

  async deleteCategory(id: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete category' };
    }
  }
}

export const categoryService = new CategoryService();
