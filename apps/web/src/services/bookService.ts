import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { BookEntity, ServiceResponse } from '../types';

const COLLECTION_NAME = 'books';

export class BookService {
  async getBooks(): Promise<BookEntity[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BookEntity, 'id'>) }));
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to real-time books from the `books` collection.
   * Empty snapshot -> empty list (real empty state).
   */
  subscribeBooks(callback: (books: BookEntity[]) => void, onError?: (error: Error) => void): () => void {
    try {
      return onSnapshot(
        query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const list: BookEntity[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<BookEntity, 'id'>)
          }));
          callback(list);
        },
        (err) => {
          console.warn('Books subscription error:', err);
          if (onError) onError(err);
          else callback([]);
        }
      );
    } catch (err) {
      console.warn('Books query error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      else callback([]);
      return () => {};
    }
  }

  async addBook(book: Omit<BookEntity, 'id'>): Promise<ServiceResponse<BookEntity>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...book,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, data: { id: docRef.id, ...book } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to save book' };
    }
  }

  async updateBook(id: string, updates: Partial<BookEntity>): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update book' };
    }
  }

  async deleteBook(id: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete book' };
    }
  }
}

export const bookService = new BookService();
