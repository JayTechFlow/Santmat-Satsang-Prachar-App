import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface QueryFilter {
  field: string;
  operator: '==' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in' | '!=';
  value: any;
}

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CustomQueryOptions {
  filters?: QueryFilter[];
  sorts?: QuerySort[];
  limit?: number;
}

export function buildQueryConstraints(options: CustomQueryOptions = {}): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  if (options.filters) {
    options.filters.forEach(f => constraints.push(where(f.field, f.operator, f.value)));
  }
  if (options.sorts) {
    options.sorts.forEach(s => constraints.push(orderBy(s.field, s.direction)));
  }
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  return constraints;
}

export interface PaginationOptions {
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: any | null;
  total: number;
}

export class BaseRepository<T extends { id: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collectionRef() {
    return collection(db, this.collectionName);
  }

  protected docRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  public async getAll(options: CustomQueryOptions | QueryConstraint[] = {}): Promise<T[]> {
    const constraints = Array.isArray(options)
      ? options
      : buildQueryConstraints(options);
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

  public async create(item: Omit<T, 'id'> | T, customId?: string): Promise<T> {
    const targetRef = customId ? this.docRef(customId) : doc(this.collectionRef);
    const { id: _id, ...dataToSave } = item as any;
    await setDoc(targetRef, dataToSave);
    return { ...item, id: targetRef.id } as T;
  }

  public async update(id: string, updates: Partial<T>): Promise<void> {
    const { id: _id, ...dataToUpdate } = updates as any;
    await updateDoc(this.docRef(id), dataToUpdate);
  }

  public async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }

  public async count(options: CustomQueryOptions = {}): Promise<number> {
    const constraints = buildQueryConstraints(options);
    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  public async paginate(
    options: PaginationOptions,
    queryOptions: CustomQueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const constraints = buildQueryConstraints(queryOptions);
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
    const total = await this.count(queryOptions);

    return { data, lastDoc, total };
  }
}
