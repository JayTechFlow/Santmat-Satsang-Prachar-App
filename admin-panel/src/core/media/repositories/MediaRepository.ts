// Enterprise Media Platform — Media Repository (Firestore)
// Sprint M6.10 — Agent C: Firestore Media Metadata

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import {
  MediaStatus,
  MediaVisibility,
  MediaUploadStatus,
  MediaProcessingStatus,
  MediaAiStatus,
  type MediaAsset,
  type MediaListOptions,
  type MediaPaginatedResult,
  type MediaThumbnailsMap,
  type MediaPreviewsMap,
  type MediaChecksums,
  type MediaAiMetadata,
} from '../types/media.types';
import { MEDIA_FIRESTORE_COLLECTIONS } from '../constants/media.constants';

export class MediaRepository {
  private readonly collectionName = MEDIA_FIRESTORE_COLLECTIONS.MEDIA;

  /**
   * Save a new MediaAsset document in Firestore.
   */
  async create(asset: Omit<MediaAsset, 'id'>): Promise<MediaAsset> {
    const docRef = doc(collection(db, this.collectionName));
    const now = new Date();

    const mediaDoc: Record<string, any> = {
      ...asset,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
      status: asset.status ?? MediaStatus.ACTIVE,
      uploadStatus: asset.uploadStatus ?? MediaUploadStatus.UPLOADED,
      processingStatus: asset.processingStatus ?? MediaProcessingStatus.NONE,
      aiStatus: asset.aiStatus ?? MediaAiStatus.NONE,
      visibility: asset.visibility ?? MediaVisibility.AUTHENTICATED,
      tags: asset.tags ?? [],
      downloadCount: asset.downloadCount ?? 0,
      playCount: asset.playCount ?? 0,
      viewCount: asset.viewCount ?? 0,
    };

    await setDoc(docRef, mediaDoc);
    return { ...mediaDoc, id: docRef.id } as MediaAsset;
  }

  /**
   * Get single MediaAsset by ID.
   */
  async getById(id: string): Promise<MediaAsset | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.parseDoc(snap);
  }

  /**
   * Fetch paginated media assets with filter, search, sort options.
   */
  async getPaginated(options: MediaListOptions = {}, lastSnap?: DocumentSnapshot): Promise<{
    result: MediaPaginatedResult;
    lastSnap?: DocumentSnapshot;
  }> {
    const { filter = {}, sortBy = 'createdAt', sortDirection = 'desc', page = 1, pageSize = 24 } = options;

    const q = collection(db, this.collectionName);
    const constraints: any[] = [];

    if (filter.type) constraints.push(where('type', '==', filter.type));
    if (filter.category) constraints.push(where('category', '==', filter.category));
    if (filter.status) {
      constraints.push(where('status', '==', filter.status));
    } else {
      constraints.push(where('status', '!=', MediaStatus.DELETED));
    }
    if (filter.folder) constraints.push(where('folder', '==', filter.folder));
    if (filter.visibility) constraints.push(where('visibility', '==', filter.visibility));
    if (filter.uploadedBy) constraints.push(where('uploadedBy', '==', filter.uploadedBy));
    if (filter.linkedEntityId) constraints.push(where('linkedEntityId', '==', filter.linkedEntityId));

    constraints.push(orderBy(sortBy, sortDirection));
    constraints.push(limit(pageSize + 1));

    if (lastSnap) {
      constraints.push(startAfter(lastSnap));
    }

    const searchQuery = query(q, ...constraints);
    const snap = await getDocs(searchQuery);

    let docsList = snap.docs.map((d) => this.parseDoc(d));

    if (filter.searchTerm && filter.searchTerm.trim() !== '') {
      const term = filter.searchTerm.toLowerCase().trim();
      docsList = docsList.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(term)) ||
          (a.description && a.description.toLowerCase().includes(term)) ||
          (a.metadata?.originalFilename && a.metadata.originalFilename.toLowerCase().includes(term)) ||
          (a.tags && a.tags.some((t: string) => t.toLowerCase().includes(term)))
      );
    }

    const hasMore = docsList.length > pageSize;
    const assets = hasMore ? docsList.slice(0, pageSize) : docsList;
    const newLastSnap = snap.docs.length > 0 ? snap.docs[Math.min(pageSize - 1, snap.docs.length - 1)] : undefined;

    return {
      result: {
        assets,
        total: assets.length,
        page,
        pageSize,
        hasMore,
      },
      lastSnap: newLastSnap,
    };
  }

  /**
   * Update MediaAsset properties.
   */
  async update(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    const docRef = doc(db, this.collectionName, id);
    const updatedData: Record<string, any> = {
      ...updates,
      updatedAt: new Date(),
    };
    await updateDoc(docRef, updatedData);

    const snap = await getDoc(docRef);
    return this.parseDoc(snap);
  }

  /**
   * Update upload status.
   */
  async updateUploadStatus(id: string, uploadStatus: MediaUploadStatus): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      uploadStatus,
      updatedAt: new Date(),
    });
  }

  /**
   * Update processing status and processing job link.
   */
  async updateProcessingStatus(
    id: string,
    processingStatus: MediaProcessingStatus,
    processingJobId?: string
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updates: Record<string, any> = {
      processingStatus,
      updatedAt: new Date(),
    };
    if (processingJobId) updates.processingJobId = processingJobId;
    await updateDoc(docRef, updates);
  }

  /**
   * Update AI status and AI metadata (captions, tags, transcript, moderation).
   */
  async updateAiStatus(id: string, aiStatus: MediaAiStatus, aiMetadata?: MediaAiMetadata): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updates: Record<string, any> = {
      aiStatus,
      updatedAt: new Date(),
    };
    if (aiMetadata) updates.aiMetadata = aiMetadata;
    await updateDoc(docRef, updates);
  }

  /**
   * Update thumbnails (variants, primary thumbnail URL and path).
   */
  async updateThumbnails(
    id: string,
    thumbnails: MediaThumbnailsMap,
    thumbnailUrl?: string,
    thumbnailPath?: string
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updates: Record<string, any> = {
      thumbnails,
      updatedAt: new Date(),
    };
    if (thumbnailUrl) updates.thumbnailUrl = thumbnailUrl;
    if (thumbnailPath) updates.thumbnailPath = thumbnailPath;
    await updateDoc(docRef, updates);
  }

  /**
   * Update previews.
   */
  async updatePreviews(id: string, previews: MediaPreviewsMap): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      previews,
      updatedAt: new Date(),
    });
  }

  /**
   * Update checksums.
   */
  async updateChecksums(id: string, checksums: MediaChecksums): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      checksums,
      'metadata.checksums': checksums,
      updatedAt: new Date(),
    });
  }

  /**
   * Increment metric counters (downloadCount, playCount, viewCount).
   */
  async incrementCounter(
    id: string,
    counterField: 'downloadCount' | 'playCount' | 'viewCount',
    delta = 1
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      [counterField]: increment(delta),
      updatedAt: new Date(),
    });
  }

  /**
   * Soft delete media asset.
   */
  async softDelete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      status: MediaStatus.DELETED,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Restore soft-deleted asset.
   */
  async restore(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      status: MediaStatus.ACTIVE,
      deletedAt: null,
      updatedAt: new Date(),
    });
  }

  /**
   * Hard delete media document.
   */
  async hardDelete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  private parseDoc(snap: DocumentSnapshot): MediaAsset {
    const data = snap.data()!;
    return {
      ...data,
      id: snap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
      deletedAt: data.deletedAt?.toDate ? data.deletedAt.toDate() : data.deletedAt ? new Date(data.deletedAt) : undefined,
      expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt ? new Date(data.expiresAt) : undefined,
    } as MediaAsset;
  }
}

export const mediaRepository = new MediaRepository();
