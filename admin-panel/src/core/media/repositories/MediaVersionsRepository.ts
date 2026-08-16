// Enterprise Media Platform — Media Versions Repository (Firestore)
// Sprint M6.10 — Agent C: Firestore Media Metadata

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import type { MediaVersion } from '../types/media.types';
import { MEDIA_FIRESTORE_COLLECTIONS } from '../constants/media.constants';

export class MediaVersionsRepository {
  private readonly collectionName = MEDIA_FIRESTORE_COLLECTIONS.MEDIA_VERSIONS;

  /**
   * Save a new MediaVersion document in Firestore.
   */
  async createVersion(
    version: Omit<MediaVersion, 'versionId' | 'createdAt'> & { versionId?: string; createdAt?: Date }
  ): Promise<MediaVersion> {
    const docRef = version.versionId
      ? doc(db, this.collectionName, version.versionId)
      : doc(collection(db, this.collectionName));
    const now = new Date();

    const versionDoc: MediaVersion = {
      ...version,
      versionId: docRef.id,
      createdAt: version.createdAt || now,
    };

    await setDoc(docRef, versionDoc);
    return versionDoc;
  }

  /**
   * Get single MediaVersion by ID.
   */
  async getVersionById(versionId: string): Promise<MediaVersion | null> {
    const docRef = doc(db, this.collectionName, versionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.parseDoc(snap);
  }

  /**
   * Fetch version history for a media asset.
   */
  async getVersionHistory(mediaId: string): Promise<MediaVersion[]> {
    const q = query(
      collection(db, this.collectionName),
      where('mediaId', '==', mediaId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.parseDoc(d));
  }

  private parseDoc(snap: DocumentSnapshot): MediaVersion {
    const data = snap.data()!;
    return {
      ...data,
      versionId: snap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
    } as MediaVersion;
  }
}

export const mediaVersionsRepository = new MediaVersionsRepository();
