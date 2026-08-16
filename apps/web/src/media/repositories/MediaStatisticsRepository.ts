import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  increment,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { MediaStatistics } from '../types/media.types';
import { MEDIA_FIRESTORE_COLLECTIONS } from '../constants/media.constants';

export class MediaStatisticsRepository {
  private readonly collectionName = MEDIA_FIRESTORE_COLLECTIONS.MEDIA_STATISTICS;

  async getStatistics(mediaId: string): Promise<MediaStatistics> {
    const docRef = doc(db, this.collectionName, mediaId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return this.parseDoc(snap);
    }

    const now = new Date();
    const initialStats: MediaStatistics = {
      id: mediaId,
      mediaId,
      downloadCount: 0,
      playCount: 0,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, initialStats);
    return initialStats;
  }

  async incrementMetric(
    mediaId: string,
    metric: 'downloadCount' | 'playCount' | 'viewCount',
    delta = 1
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, mediaId);
    const now = new Date();

    const updates: Record<string, any> = {
      [metric]: increment(delta),
      updatedAt: now,
    };

    if (metric === 'playCount') updates.lastPlayedAt = now;
    if (metric === 'downloadCount') updates.lastDownloadedAt = now;

    await setDoc(docRef, updates, { merge: true });
  }

  async getTopMediaByMetric(
    metric: 'downloadCount' | 'playCount' | 'viewCount' = 'playCount',
    limitCount = 20
  ): Promise<MediaStatistics[]> {
    const q = query(collection(db, this.collectionName), orderBy(metric, 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.parseDoc(d));
  }

  private parseDoc(snap: DocumentSnapshot): MediaStatistics {
    const data = snap.data()!;
    return {
      id: snap.id,
      mediaId: data.mediaId || snap.id,
      downloadCount: data.downloadCount ?? 0,
      playCount: data.playCount ?? 0,
      viewCount: data.viewCount ?? 0,
      lastPlayedAt: data.lastPlayedAt?.toDate ? data.lastPlayedAt.toDate() : data.lastPlayedAt ? new Date(data.lastPlayedAt) : undefined,
      lastDownloadedAt: data.lastDownloadedAt?.toDate ? data.lastDownloadedAt.toDate() : data.lastDownloadedAt ? new Date(data.lastDownloadedAt) : undefined,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
    } as MediaStatistics;
  }
}

export const mediaStatisticsRepository = new MediaStatisticsRepository();
