// Enterprise Media Platform — Media Tags Repository (Firestore)
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
import type { MediaTag } from '../types/media.types';
import { MEDIA_FIRESTORE_COLLECTIONS } from '../constants/media.constants';

export class MediaTagsRepository {
  private readonly collectionName = MEDIA_FIRESTORE_COLLECTIONS.MEDIA_TAGS;

  /**
   * Save a new MediaTag document in Firestore.
   */
  async createTag(tag: Omit<MediaTag, 'id'> & { id?: string }): Promise<MediaTag> {
    const docRef = tag.id ? doc(db, this.collectionName, tag.id) : doc(collection(db, this.collectionName));
    const tagDoc: MediaTag = {
      ...tag,
      id: docRef.id,
      usageCount: tag.usageCount ?? 0,
      createdAt: tag.createdAt ?? new Date(),
    };

    await setDoc(docRef, tagDoc);
    return tagDoc;
  }

  /**
   * Get single MediaTag by ID.
   */
  async getTagById(tagId: string): Promise<MediaTag | null> {
    const docRef = doc(db, this.collectionName, tagId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.parseDoc(snap);
  }

  /**
   * Get all media tags sorted by usage count or name.
   */
  async getTags(sortBy: 'name' | 'usageCount' = 'name'): Promise<MediaTag[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy(sortBy, sortBy === 'usageCount' ? 'desc' : 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.parseDoc(d));
  }

  /**
   * Update usage count for a tag.
   */
  async updateUsageCount(tagId: string, delta = 1): Promise<void> {
    const docRef = doc(db, this.collectionName, tagId);
    await updateDoc(docRef, {
      usageCount: increment(delta),
    });
  }

  private parseDoc(snap: DocumentSnapshot): MediaTag {
    const data = snap.data()!;
    return {
      ...data,
      id: snap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : undefined,
    } as MediaTag;
  }
}

export const mediaTagsRepository = new MediaTagsRepository();
