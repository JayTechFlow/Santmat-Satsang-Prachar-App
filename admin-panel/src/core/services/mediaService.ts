// Enterprise Media Platform — Firestore Service
// Sprint M2 & Sprint M6.10 — Agent C: Full Firestore Media Metadata Management

import { type DocumentSnapshot } from 'firebase/firestore';
import {
  MediaUploadStatus,
  MediaProcessingStatus,
  MediaAiStatus,
  MediaProcessingJobStatus,
  type MediaAsset,
  type MediaListOptions,
  type MediaPaginatedResult,
  type MediaVersion,
  type MediaAuditLog,
  type MediaAuditAction,
  type MediaProcessingJob,
  type MediaTag,
  type MediaCategoryItem,
  type MediaStatistics,
  type MediaThumbnailsMap,
  type MediaPreviewsMap,
  type MediaChecksums,
  type MediaAiMetadata,
} from '../media/types/media.types';
import { mediaRepository } from '../media/repositories/MediaRepository';
import { mediaVersionsRepository } from '../media/repositories/MediaVersionsRepository';
import { mediaAuditRepository } from '../media/repositories/MediaAuditRepository';
import { mediaJobsRepository } from '../media/repositories/MediaJobsRepository';
import { mediaTagsRepository } from '../media/repositories/MediaTagsRepository';
import { mediaCategoriesRepository } from '../media/repositories/MediaCategoriesRepository';
import { mediaStatisticsRepository } from '../media/repositories/MediaStatisticsRepository';

export class MediaService {
  /**
   * Save a new MediaAsset document in Firestore.
   */
  async createMediaAsset(asset: Omit<MediaAsset, 'id'>): Promise<MediaAsset> {
    const created = await mediaRepository.create(asset);

    await mediaAuditRepository.logAudit(created.id, 'uploaded', {
      title: asset.title,
      type: asset.type,
      folder: asset.folder,
      sizeBytes: asset.metadata?.sizeBytes,
    });

    return created;
  }

  /**
   * Get single MediaAsset by ID.
   */
  async getMediaAsset(id: string): Promise<MediaAsset | null> {
    return mediaRepository.getById(id);
  }

  /**
   * Find active asset by checksum for deduplication.
   */
  async findAssetByChecksum(checksum: string): Promise<MediaAsset | null> {
    if (!checksum) return null;
    const paginated = await mediaRepository.getPaginated({
      pageSize: 100,
    });
    return paginated.result.assets.find((a) => a.metadata?.checksum === checksum || a.checksums?.md5 === checksum) || null;
  }

  /**
   * Fetch paginated media assets with filter, search, sort options.
   */
  async getMediaAssets(options: MediaListOptions = {}, lastSnap?: DocumentSnapshot): Promise<{
    result: MediaPaginatedResult;
    lastSnap?: DocumentSnapshot;
  }> {
    return mediaRepository.getPaginated(options, lastSnap);
  }

  /**
   * Update metadata, title, tags, or links of a MediaAsset.
   */
  async updateMediaAsset(id: string, updates: Partial<MediaAsset>, note?: string): Promise<MediaAsset> {
    const existing = await this.getMediaAsset(id);
    if (!existing) throw new Error(`Media asset ${id} not found`);

    if (updates.storageUrl && updates.storageUrl !== existing.storageUrl) {
      await this.createVersion(existing, note ?? 'Asset updated');
    }

    const updated = await mediaRepository.update(id, updates);

    await mediaAuditRepository.logAudit(id, 'updated', {
      previousState: existing,
      newState: updates,
    });

    return updated;
  }

  /**
   * Update upload status.
   */
  async updateUploadStatus(id: string, uploadStatus: MediaUploadStatus): Promise<void> {
    await mediaRepository.updateUploadStatus(id, uploadStatus);
    await mediaAuditRepository.logAudit(id, 'updated', { uploadStatus });
  }

  /**
   * Update processing status and linked job.
   */
  async updateProcessingStatus(
    id: string,
    processingStatus: MediaProcessingStatus,
    jobId?: string
  ): Promise<void> {
    await mediaRepository.updateProcessingStatus(id, processingStatus, jobId);
    await mediaAuditRepository.logAudit(id, 'processed', { processingStatus, jobId });
  }

  /**
   * Update AI processing status and AI metadata.
   */
  async updateAiStatus(id: string, aiStatus: MediaAiStatus, aiMetadata?: MediaAiMetadata): Promise<void> {
    await mediaRepository.updateAiStatus(id, aiStatus, aiMetadata);
    await mediaAuditRepository.logAudit(id, 'processed', { aiStatus, aiMetadata });
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
    await mediaRepository.updateThumbnails(id, thumbnails, thumbnailUrl, thumbnailPath);
    await mediaAuditRepository.logAudit(id, 'updated', { thumbnails, thumbnailUrl });
  }

  /**
   * Update previews.
   */
  async updatePreviews(id: string, previews: MediaPreviewsMap): Promise<void> {
    await mediaRepository.updatePreviews(id, previews);
    await mediaAuditRepository.logAudit(id, 'updated', { previews });
  }

  /**
   * Update checksums.
   */
  async updateChecksums(id: string, checksums: MediaChecksums): Promise<void> {
    await mediaRepository.updateChecksums(id, checksums);
    await mediaAuditRepository.logAudit(id, 'updated', { checksums });
  }

  /**
   * Soft-delete asset (sets status to 'deleted' and populates deletedAt).
   */
  async softDeleteMediaAsset(id: string): Promise<void> {
    await mediaRepository.softDelete(id);
    await mediaAuditRepository.logAudit(id, 'deleted', { softDelete: true });
  }

  /**
   * Restore soft-deleted asset.
   */
  async restoreMediaAsset(id: string): Promise<void> {
    await mediaRepository.restore(id);
    await mediaAuditRepository.logAudit(id, 'restored', { restoredAt: new Date().toISOString() });
  }

  /**
   * Hard-delete asset document from Firestore.
   */
  async hardDeleteMediaAsset(id: string): Promise<void> {
    await mediaRepository.hardDelete(id);
    await mediaAuditRepository.logAudit(id, 'deleted', { hardDelete: true });
  }

  /**
   * Bulk soft-delete assets.
   */
  async bulkSoftDelete(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.softDeleteMediaAsset(id)));
  }

  /**
   * Bulk restore assets.
   */
  async bulkRestore(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.restoreMediaAsset(id)));
  }

  /**
   * Bulk hard-delete assets.
   */
  async bulkHardDelete(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.hardDeleteMediaAsset(id)));
  }

  /**
   * Create version snapshot in media_versions collection.
   */
  async createVersion(asset: MediaAsset, note: string): Promise<MediaVersion> {
    return mediaVersionsRepository.createVersion({
      mediaId: asset.id,
      storageUrl: asset.storageUrl,
      storagePath: asset.storagePath,
      metadata: asset.metadata,
      createdBy: asset.uploadedBy || 'system',
      note,
      createdAt: new Date(),
    });
  }

  /**
   * Fetch version history.
   */
  async getVersionHistory(mediaId: string): Promise<MediaVersion[]> {
    return mediaVersionsRepository.getVersionHistory(mediaId);
  }

  /**
   * Audit logging.
   */
  async logAudit(mediaId: string, action: MediaAuditAction, details?: Record<string, any>): Promise<string> {
    return mediaAuditRepository.logAudit(mediaId, action, details);
  }

  /**
   * Get audit logs.
   */
  async getAuditLogs(mediaId?: string, limitCount = 50): Promise<MediaAuditLog[]> {
    return mediaAuditRepository.getAuditLogs(mediaId, limitCount);
  }

  /**
   * Jobs management.
   */
  async createProcessingJob(job: Omit<MediaProcessingJob, 'id'>): Promise<MediaProcessingJob> {
    return mediaJobsRepository.createJob(job);
  }

  async getProcessingJob(jobId: string): Promise<MediaProcessingJob | null> {
    return mediaJobsRepository.getJobById(jobId);
  }

  async updateProcessingJobStatus(
    jobId: string,
    status: MediaProcessingJobStatus,
    output?: Record<string, unknown>,
    errorMessage?: string
  ): Promise<void> {
    await mediaJobsRepository.updateJobStatus(jobId, status, output, errorMessage);
  }

  /**
   * Tags management.
   */
  async createTag(tag: Omit<MediaTag, 'id'>): Promise<MediaTag> {
    return mediaTagsRepository.createTag(tag);
  }

  async getTags(): Promise<MediaTag[]> {
    return mediaTagsRepository.getTags();
  }

  /**
   * Categories management.
   */
  async createCategory(category: Omit<MediaCategoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaCategoryItem> {
    return mediaCategoriesRepository.createCategory(category);
  }

  async getCategories(): Promise<MediaCategoryItem[]> {
    return mediaCategoriesRepository.getCategories();
  }

  /**
   * Statistics & counter tracking.
   */
  async recordMediaMetric(
    mediaId: string,
    metric: 'downloadCount' | 'playCount' | 'viewCount',
    delta = 1
  ): Promise<void> {
    await mediaRepository.incrementCounter(mediaId, metric, delta);
    await mediaStatisticsRepository.incrementMetric(mediaId, metric, delta);
  }

  async getMediaStatistics(mediaId: string): Promise<MediaStatistics> {
    return mediaStatisticsRepository.getStatistics(mediaId);
  }
}

export const mediaService = new MediaService();
