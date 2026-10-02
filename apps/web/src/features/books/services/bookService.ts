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
import { db } from '../../../lib/firebase/config';
import { BookEntity, ServiceResponse } from '../../../types/common/index';

const COLLECTION_NAME = 'books';

export function normalizeBookEntity(id: string, data: any): BookEntity {
  return {
    id,
    title: String(data.title || '').trim(),
    author: String(data.author || '').trim(),
    category: String(data.category || '').trim(),
    coverUrl: data.coverUrl ? String(data.coverUrl).trim() : undefined,
    pdfUrl: data.pdfUrl ? String(data.pdfUrl).trim() : undefined,
    storagePath: data.storagePath ? String(data.storagePath).trim() : undefined,
    pagesCount: data.pagesCount !== undefined ? Number(data.pagesCount) : undefined,
    publishDate: data.publishDate ? String(data.publishDate).trim() : undefined,
    status: data.status || 'published',
    language: data.language ? String(data.language).trim() : undefined,
    description: data.description ? String(data.description).trim() : undefined,
  };
}

export class BookService {
  async getBooks(): Promise<BookEntity[]> {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const saved = localStorage.getItem('mock_books');
      return saved ? JSON.parse(saved) : [];
    }
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map(d => normalizeBookEntity(d.id, d.data()));
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to real-time books from the `books` collection.
   * Empty snapshot -> empty list (real empty state).
   */
  subscribeBooks(callback: (books: BookEntity[]) => void, onError?: (error: Error) => void): () => void {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const load = () => {
        const saved = localStorage.getItem('mock_books');
        callback(saved ? JSON.parse(saved) : []);
      };
      load();
      window.addEventListener('storage', load);
      return () => {
        window.removeEventListener('storage', load);
      };
    }
    try {
      return onSnapshot(
        query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const list: BookEntity[] = snapshot.docs.map((d) => normalizeBookEntity(d.id, d.data()));
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
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const saved = localStorage.getItem('mock_books');
      const list = saved ? JSON.parse(saved) : [];
      const newBook: BookEntity = { 
        id: 'mock-book-' + Date.now(), 
        ...book,
        language: book.language || 'हिंदी',
      };
      list.unshift(newBook);
      localStorage.setItem('mock_books', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      return { success: true, data: newBook };
    }
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
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const saved = localStorage.getItem('mock_books');
      let list = saved ? JSON.parse(saved) : [];
      list = list.map((b: any) => b.id === id ? { ...b, ...updates } : b);
      localStorage.setItem('mock_books', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      return { success: true };
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update book' };
    }
  }

  async deleteBook(id: string): Promise<ServiceResponse<void>> {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const saved = localStorage.getItem('mock_books');
      let list = saved ? JSON.parse(saved) : [];
      list = list.filter((b: any) => b.id !== id);
      localStorage.setItem('mock_books', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      return { success: true };
    }
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
