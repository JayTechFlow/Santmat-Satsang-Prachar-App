import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';

export abstract class BaseRepository<T extends { id: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(db, this.collectionName), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
  }

  async getById(id: string): Promise<T | null> {
    const snap = await getDoc(doc(db, this.collectionName, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as unknown as T;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const docRef = await addDoc(collection(db, this.collectionName), data);
    return { id: docRef.id, ...data } as unknown as T;
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), updates as any);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}
