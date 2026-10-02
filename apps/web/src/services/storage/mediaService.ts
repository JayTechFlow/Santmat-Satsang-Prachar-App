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
} from '../../lib/media/types/media.types';
import { mediaRepository } from '../../lib/media/repositories/MediaRepository';
import { mediaVersionsRepository } from '../../lib/media/repositories/MediaVersionsRepository';
import { mediaAuditRepository } from '../../lib/media/repositories/MediaAuditRepository';
import { mediaJobsRepository } from '../../lib/media/repositories/MediaJobsRepository';
import { mediaTagsRepository } from '../../lib/media/repositories/MediaTagsRepository';
import { mediaCategoriesRepository } from '../../lib/media/repositories/MediaCategoriesRepository';
import { mediaStatisticsRepository } from '../../lib/media/repositories/MediaStatisticsRepository';

export class MediaService {
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

  async getMediaAsset(id: string): Promise<MediaAsset | null> {
    return mediaRepository.getById(id);
  }

  async findAssetByChecksum(checksum: string): Promise<MediaAsset | null> {
    if (!checksum) return null;
    const paginated = await mediaRepository.getPaginated({
      pageSize: 100,
    });
    return paginated.result.assets.find((a) => a.metadata?.checksum === checksum || a.checksums?.md5 === checksum) || null;
  }

  async getMediaAssets(options: MediaListOptions = {}, lastSnap?: DocumentSnapshot): Promise<{
    result: MediaPaginatedResult;
    lastSnap?: DocumentSnapshot;
  }> {
    return mediaRepository.getPaginated(options, lastSnap);
  }

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

  async updateUploadStatus(id: string, uploadStatus: MediaUploadStatus): Promise<void> {
    await mediaRepository.updateUploadStatus(id, uploadStatus);
    await mediaAuditRepository.logAudit(id, 'updated', { uploadStatus });
  }

  async updateProcessingStatus(
    id: string,
    processingStatus: MediaProcessingStatus,
    jobId?: string
  ): Promise<void> {
    await mediaRepository.updateProcessingStatus(id, processingStatus, jobId);
    await mediaAuditRepository.logAudit(id, 'processed', { processingStatus, jobId });
  }

  async updateAiStatus(id: string, aiStatus: MediaAiStatus, aiMetadata?: MediaAiMetadata): Promise<void> {
    await mediaRepository.updateAiStatus(id, aiStatus, aiMetadata);
    await mediaAuditRepository.logAudit(id, 'processed', { aiStatus, aiMetadata });
  }

  async updateThumbnails(
    id: string,
    thumbnails: MediaThumbnailsMap,
    thumbnailUrl?: string,
    thumbnailPath?: string
  ): Promise<void> {
    await mediaRepository.updateThumbnails(id, thumbnails, thumbnailUrl, thumbnailPath);
    await mediaAuditRepository.logAudit(id, 'updated', { thumbnails, thumbnailUrl });
  }

  async updatePreviews(id: string, previews: MediaPreviewsMap): Promise<void> {
    await mediaRepository.updatePreviews(id, previews);
    await mediaAuditRepository.logAudit(id, 'updated', { previews });
  }

  async updateChecksums(id: string, checksums: MediaChecksums): Promise<void> {
    await mediaRepository.updateChecksums(id, checksums);
    await mediaAuditRepository.logAudit(id, 'updated', { checksums });
  }

  async softDeleteMediaAsset(id: string): Promise<void> {
    await mediaRepository.softDelete(id);
    await mediaAuditRepository.logAudit(id, 'deleted', { softDelete: true });
  }

  async restoreMediaAsset(id: string): Promise<void> {
    await mediaRepository.restore(id);
    await mediaAuditRepository.logAudit(id, 'restored', { restoredAt: new Date().toISOString() });
  }

  async hardDeleteMediaAsset(id: string): Promise<void> {
    await mediaRepository.hardDelete(id);
    await mediaAuditRepository.logAudit(id, 'deleted', { hardDelete: true });
  }

  async bulkSoftDelete(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.softDeleteMediaAsset(id)));
  }

  async bulkRestore(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.restoreMediaAsset(id)));
  }

  async bulkHardDelete(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.hardDeleteMediaAsset(id)));
  }

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

  async getVersionHistory(mediaId: string): Promise<MediaVersion[]> {
    return mediaVersionsRepository.getVersionHistory(mediaId);
  }

  async logAudit(mediaId: string, action: MediaAuditAction, details?: Record<string, any>): Promise<string> {
    return mediaAuditRepository.logAudit(mediaId, action, details);
  }

  async getAuditLogs(mediaId?: string, limitCount = 50): Promise<MediaAuditLog[]> {
    return mediaAuditRepository.getAuditLogs(mediaId, limitCount);
  }

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

  async createTag(tag: Omit<MediaTag, 'id'>): Promise<MediaTag> {
    return mediaTagsRepository.createTag(tag);
  }

  async getTags(): Promise<MediaTag[]> {
    return mediaTagsRepository.getTags();
  }

  async createCategory(category: Omit<MediaCategoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaCategoryItem> {
    return mediaCategoriesRepository.createCategory(category);
  }

  async getCategories(): Promise<MediaCategoryItem[]> {
    return mediaCategoriesRepository.getCategories();
  }

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
