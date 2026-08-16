// Enterprise Media Platform — Media Repositories Unit & Integration Tests
// Sprint M6.10 — Agent C: Firestore Media Metadata

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MediaStatus,
  MediaVisibility,
  MediaUploadStatus,
  MediaProcessingStatus,
  MediaAiStatus,
  MediaProcessingJobStatus,
  MediaType,
  MediaFolder,
  MediaCategory,
} from '../types/media.types';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ type: 'collection', name })),
    doc: vi.fn((_db, name, id) => ({ id: id || 'generated_doc_id', type: 'doc', name })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn().mockResolvedValue(undefined),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    query: vi.fn((...args) => ({ type: 'query', args })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    orderBy: vi.fn((field, dir) => ({ field, dir })),
    limit: vi.fn((count) => ({ count })),
    startAfter: vi.fn((snap) => ({ snap })),
    increment: vi.fn((val) => ({ increment: val })),
    serverTimestamp: vi.fn(() => new Date()),
  };
});

// Mock Firebase Config
vi.mock('../../../firebase/config', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'admin_user_123',
      email: 'admin@santmatsatsang.org',
    },
  },
}));

import { MediaRepository } from './MediaRepository';
import { MediaVersionsRepository } from './MediaVersionsRepository';
import { MediaAuditRepository } from './MediaAuditRepository';
import { MediaJobsRepository } from './MediaJobsRepository';
import { MediaTagsRepository } from './MediaTagsRepository';
import { MediaCategoriesRepository } from './MediaCategoriesRepository';
import { MediaStatisticsRepository } from './MediaStatisticsRepository';
import { mediaService } from '../../services/mediaService';
import * as firestore from 'firebase/firestore';

describe('Firestore Media Metadata Repositories', () => {
  let mediaRepo: MediaRepository;
  let versionsRepo: MediaVersionsRepository;
  let auditRepo: MediaAuditRepository;
  let jobsRepo: MediaJobsRepository;
  let tagsRepo: MediaTagsRepository;
  let categoriesRepo: MediaCategoriesRepository;
  let statsRepo: MediaStatisticsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mediaRepo = new MediaRepository();
    versionsRepo = new MediaVersionsRepository();
    auditRepo = new MediaAuditRepository();
    jobsRepo = new MediaJobsRepository();
    tagsRepo = new MediaTagsRepository();
    categoriesRepo = new MediaCategoriesRepository();
    statsRepo = new MediaStatisticsRepository();
  });

  describe('1. MediaRepository (media collection)', () => {
    it('creates a media document with full metadata, statuses, thumbnails, previews, and counters', async () => {
      const assetData = {
        type: MediaType.AUDIO,
        category: MediaCategory.BHAJAN,
        status: MediaStatus.ACTIVE,
        uploadStatus: MediaUploadStatus.UPLOADED,
        processingStatus: MediaProcessingStatus.COMPLETED,
        aiStatus: MediaAiStatus.COMPLETED,
        visibility: MediaVisibility.PUBLIC,
        folder: MediaFolder.AUDIO,
        storageUrl: 'https://storage.googleapis.com/audio/satsang1.mp3',
        storagePath: 'audio/satsang1.mp3',
        thumbnailUrl: 'https://storage.googleapis.com/images/thumb1.jpg',
        thumbnailPath: 'images/thumb1.jpg',
        thumbnails: {
          small: { url: 'https://storage.googleapis.com/images/small.jpg', path: 'images/small.jpg', width: 100, height: 100 },
          medium: { url: 'https://storage.googleapis.com/images/med.jpg', path: 'images/med.jpg', width: 300, height: 300 },
        },
        previews: {
          previewUrl: 'https://storage.googleapis.com/audio/preview1.mp3',
          durationSeconds: 30,
        },
        duration: 1800,
        dimensions: { width: 1920, height: 1080, aspectRatio: 1.77 },
        checksums: { md5: 'd41d8cd98f00b204e9800998ecf8427e', sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
        aiMetadata: {
          captions: ['Spiritual discourse on Satguru guidance'],
          tags: ['satsang', 'bhajan'],
          transcript: 'Full transcript of satsang...',
        },
        metadata: {
          filename: 'satsang1.mp3',
          originalFilename: 'Satsang Audio 1.mp3',
          mimeType: 'audio/mpeg',
          sizeBytes: 15420000,
          extension: 'mp3',
          checksum: 'd41d8cd98f00b204e9800998ecf8427e',
          duration: 1800,
        },
        tags: ['bhajan', 'satsang'],
        title: 'Morning Satsang Discourse',
        description: 'Inspiring discourse on spirituality',
        uploadedBy: 'admin_user_123',
        downloadCount: 0,
        playCount: 0,
        viewCount: 0,
      };

      const result = await mediaRepo.create(assetData as any);
      expect(firestore.setDoc).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.uploadStatus).toBe(MediaUploadStatus.UPLOADED);
      expect(result.processingStatus).toBe(MediaProcessingStatus.COMPLETED);
      expect(result.aiStatus).toBe(MediaAiStatus.COMPLETED);
      expect(result.duration).toBe(1800);
      expect(result.checksums?.md5).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('updates status and metadata fields correctly', async () => {
      await mediaRepo.updateUploadStatus('media_1', MediaUploadStatus.PROCESSING);
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ uploadStatus: MediaUploadStatus.PROCESSING })
      );

      await mediaRepo.updateProcessingStatus('media_1', MediaProcessingStatus.COMPLETED, 'job_99');
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ processingStatus: MediaProcessingStatus.COMPLETED, processingJobId: 'job_99' })
      );

      await mediaRepo.updateAiStatus('media_1', MediaAiStatus.COMPLETED, { tags: ['ai_tag_1'] });
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ aiStatus: MediaAiStatus.COMPLETED, aiMetadata: { tags: ['ai_tag_1'] } })
      );
    });

    it('increments metric counters using FieldValue increment', async () => {
      await mediaRepo.incrementCounter('media_1', 'playCount', 1);
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ playCount: expect.objectContaining({ increment: 1 }) })
      );
    });

    it('handles soft-delete and restore operations', async () => {
      await mediaRepo.softDelete('media_1');
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: MediaStatus.DELETED })
      );

      await mediaRepo.restore('media_1');
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: MediaStatus.ACTIVE, deletedAt: null })
      );
    });
  });

  describe('2. MediaVersionsRepository (media_versions collection)', () => {
    it('creates version snapshot and queries history by mediaId', async () => {
      const version = await versionsRepo.createVersion({
        mediaId: 'media_1',
        storageUrl: 'https://storage.googleapis.com/audio/v2.mp3',
        storagePath: 'audio/v2.mp3',
        metadata: {
          filename: 'v2.mp3',
          originalFilename: 'v2.mp3',
          mimeType: 'audio/mpeg',
          sizeBytes: 20000,
          extension: 'mp3',
        },
        createdBy: 'admin_user_123',
        note: 'Re-encoded audio version',
        createdAt: new Date(),
      });

      expect(firestore.setDoc).toHaveBeenCalled();
      expect(version.versionId).toBeDefined();

      vi.mocked(firestore.getDocs).mockResolvedValueOnce({
        docs: [
          {
            id: version.versionId,
            data: () => ({ ...version, createdAt: new Date() }),
          },
        ],
      } as any);

      const history = await versionsRepo.getVersionHistory('media_1');
      expect(history.length).toBe(1);
      expect(history[0].mediaId).toBe('media_1');
    });
  });

  describe('3. MediaAuditRepository (media_audit collection)', () => {
    it('logs audit action to media_audit collection', async () => {
      await auditRepo.logAudit('media_1', 'uploaded', { size: 100 }, 'user_1', 'user1@example.com');
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          mediaId: 'media_1',
          action: 'uploaded',
          performedBy: 'user_1',
          performedByEmail: 'user1@example.com',
        })
      );
    });

    it('fetches audit logs for media asset', async () => {
      vi.mocked(firestore.getDocs).mockResolvedValueOnce({
        docs: [
          {
            id: 'audit_log_1',
            data: () => ({
              mediaId: 'media_1',
              action: 'uploaded',
              timestamp: new Date(),
            }),
          },
        ],
      } as any);

      const logs = await auditRepo.getAuditLogs('media_1', 10);
      expect(logs.length).toBe(1);
      expect(logs[0].id).toBe('audit_log_1');
    });
  });

  describe('4. MediaJobsRepository (media_jobs collection)', () => {
    it('creates processing job and updates job status with output', async () => {
      const job = await jobsRepo.createJob({
        mediaId: 'media_1',
        type: 'thumbnail_generation',
        status: MediaProcessingJobStatus.QUEUED,
        input: { resolution: '300x300' },
        retryCount: 0,
        maxRetries: 3,
        scheduledAt: new Date(),
        createdAt: new Date(),
      });

      expect(firestore.setDoc).toHaveBeenCalled();
      expect(job.id).toBeDefined();

      await jobsRepo.updateJobStatus('job_123', MediaProcessingJobStatus.COMPLETED, { thumbnailUrl: 'https://thumb.jpg' });
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: MediaProcessingJobStatus.COMPLETED,
          output: { thumbnailUrl: 'https://thumb.jpg' },
        })
      );
    });
  });

  describe('5. MediaTagsRepository (media_tags collection)', () => {
    it('creates tag and updates tag usage count', async () => {
      const tag = await tagsRepo.createTag({
        name: 'Satsang',
        slug: 'satsang',
        color: '#FF5722',
      });

      expect(firestore.setDoc).toHaveBeenCalled();
      expect(tag.id).toBeDefined();

      await tagsRepo.updateUsageCount('tag_1', 1);
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ usageCount: expect.objectContaining({ increment: 1 }) })
      );
    });
  });

  describe('6. MediaCategoriesRepository (media_categories collection)', () => {
    it('creates category and updates category item count', async () => {
      const category = await categoriesRepo.createCategory({
        name: 'Bhajans',
        slug: 'bhajans',
        type: MediaType.AUDIO,
        itemCount: 5,
      });

      expect(firestore.setDoc).toHaveBeenCalled();
      expect(category.id).toBeDefined();

      await categoriesRepo.updateItemCount(category.id, 1);
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ itemCount: expect.objectContaining({ increment: 1 }) })
      );
    });
  });

  describe('7. MediaStatisticsRepository (media_statistics collection)', () => {
    it('initializes and increments media statistics counters', async () => {
      vi.mocked(firestore.getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const stats = await statsRepo.getStatistics('media_1');
      expect(stats.mediaId).toBe('media_1');
      expect(stats.playCount).toBe(0);

      await statsRepo.incrementMetric('media_1', 'playCount', 1);
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ playCount: expect.objectContaining({ increment: 1 }) }),
        { merge: true }
      );
    });
  });

  describe('8. MediaService High-Level Integration', () => {
    it('records media metric across media doc and statistics doc', async () => {
      await mediaService.recordMediaMetric('media_1', 'playCount', 1);
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ playCount: expect.objectContaining({ increment: 1 }) })
      );
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ playCount: expect.objectContaining({ increment: 1 }) }),
        { merge: true }
      );
    });
  });
});
