import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} from 'firebase/firestore';
import type { Firestore, DocumentData, QueryDocumentSnapshot, QueryConstraint } from 'firebase/firestore';

export interface PaginationOptions {
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  total: number;
}

export class BaseRepository<T extends { id: string }> {
  protected collectionName: string;
  protected db: Firestore;

  constructor(db: Firestore, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  protected get collectionRef() {
    return collection(this.db, this.collectionName);
  }

  protected docRef(id: string) {
    return doc(this.db, this.collectionName, id);
  }

  public async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(this.collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
  }

  public async getById(id: string): Promise<T | null> {
    const docSnap = await getDoc(this.docRef(id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T;
    }
    return null;
  }

  public async create(item: T, customId?: string): Promise<T> {
    const docRef = customId ? this.docRef(customId) : doc(this.collectionRef);
    const { id: _id, ...dataToSave } = item as any;
    await setDoc(docRef, dataToSave);
    return { ...item, id: docRef.id };
  }

  public async update(id: string, item: Partial<T>): Promise<void> {
    const { id: _id, ...dataToUpdate } = item as any;
    await updateDoc(this.docRef(id), dataToUpdate);
  }

  public async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }

  public async count(constraints: QueryConstraint[] = []): Promise<number> {
    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  public async paginate(
    options: PaginationOptions,
    constraints: QueryConstraint[] = []
  ): Promise<PaginatedResult<T>> {
    const queryConstraints: QueryConstraint[] = [...constraints];

    if (options.orderByField) {
      queryConstraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    if (options.startAfter) {
      queryConstraints.push(startAfter(options.startAfter));
    }

    if (options.limit) {
      queryConstraints.push(limit(options.limit));
    }

    const q = query(this.collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

    // Optional: Get total count based on basic constraints if needed
    const total = await this.count(constraints);

    return { data, lastDoc, total };
  }
}
