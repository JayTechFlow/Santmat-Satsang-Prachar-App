// Enterprise Media Platform — Media Categories Repository (Firestore)
// Sprint M6.10 — Agent C: Firestore Media Metadata

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  increment,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import type { MediaCategoryItem } from '../types/media.types';
import { MEDIA_FIRESTORE_COLLECTIONS } from '../constants/media.constants';

export class MediaCategoriesRepository {
  private readonly collectionName = MEDIA_FIRESTORE_COLLECTIONS.MEDIA_CATEGORIES;

  /**
   * Create or update a MediaCategory document in Firestore.
   */
  async createCategory(category: Omit<MediaCategoryItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<MediaCategoryItem> {
    const docRef = category.id ? doc(db, this.collectionName, category.id) : doc(collection(db, this.collectionName));
    const now = new Date();

    const categoryDoc: MediaCategoryItem = {
      ...category,
      id: docRef.id,
      itemCount: category.itemCount ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, categoryDoc);
    return categoryDoc;
  }

  /**
   * Get single MediaCategory by ID.
   */
  async getCategoryById(id: string): Promise<MediaCategoryItem | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.parseDoc(snap);
  }

  /**
   * Get all media categories.
   */
  async getCategories(): Promise<MediaCategoryItem[]> {
    const q = query(collection(db, this.collectionName), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.parseDoc(d));
  }

  /**
   * Update category item count.
   */
  async updateItemCount(id: string, delta = 1): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      itemCount: increment(delta),
      updatedAt: new Date(),
    });
  }

  private parseDoc(snap: DocumentSnapshot): MediaCategoryItem {
    const data = snap.data()!;
    return {
      ...data,
      id: snap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
    } as MediaCategoryItem;
  }
}

export const mediaCategoriesRepository = new MediaCategoriesRepository();
