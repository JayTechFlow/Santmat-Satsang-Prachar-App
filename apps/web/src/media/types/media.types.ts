import type { UploadTaskControl } from '../interfaces/IMediaStorageProvider';

export const MediaType = {
  AUDIO: 'audio',
  IMAGE: 'image',
  BANNER: 'banner',
  PDF: 'pdf',
  VIDEO: 'video',
  DOCUMENT: 'document',
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const MediaStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  FAILED: 'failed',
  DELETED: 'deleted',
} as const;
export type MediaStatus = (typeof MediaStatus)[keyof typeof MediaStatus];

export const MediaVisibility = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  ADMIN_ONLY: 'admin_only',
} as const;
export type MediaVisibility = (typeof MediaVisibility)[keyof typeof MediaVisibility];

export const MediaCategory = {
  BHAJAN: 'bhajan',
  STUTI_VINATI: 'stuti_vinati',
  BOOK: 'book',
  BANNER: 'banner',
  AVATAR: 'avatar',
  EVENT: 'event',
  NOTIFICATION: 'notification',
  GENERAL: 'general',
} as const;
export type MediaCategory = (typeof MediaCategory)[keyof typeof MediaCategory];

export const MediaFolder = {
  AUDIO: 'audio',
  BOOKS: 'books',
  BANNERS: 'banners',
  IMAGES: 'images',
  VIDEOS: 'videos',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  EVENTS: 'events',
  EXPORTS: 'exports',
  TEMP: 'temp',
  PROCESSING: 'processing',
  BACKUPS: 'backups',
} as const;
export type MediaFolder = (typeof MediaFolder)[keyof typeof MediaFolder];

export const MediaUploadStatus = {
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  FAILED: 'failed',
  PROCESSING: 'processing',
} as const;
export type MediaUploadStatus = (typeof MediaUploadStatus)[keyof typeof MediaUploadStatus];

export const MediaProcessingStatus = {
  NONE: 'none',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
export type MediaProcessingStatus = (typeof MediaProcessingStatus)[keyof typeof MediaProcessingStatus];

export const MediaAiStatus = {
  NONE: 'none',
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
export type MediaAiStatus = (typeof MediaAiStatus)[keyof typeof MediaAiStatus];

export interface MediaThumbnailVariant {
  url: string;
  path: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

export interface MediaThumbnailsMap {
  small?: MediaThumbnailVariant;
  medium?: MediaThumbnailVariant;
  large?: MediaThumbnailVariant;
  [key: string]: MediaThumbnailVariant | undefined;
}

export interface MediaPreviewsMap {
  previewUrl?: string;
  previewPath?: string;
  durationSeconds?: number;
  waveformUrl?: string;
  [key: string]: unknown;
}

export interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface MediaChecksums {
  md5?: string;
  sha256?: string;
  crc32c?: string;
}

export interface MediaAiMetadata {
  captions?: string[];
  tags?: string[];
  transcript?: string;
  summary?: string;
  moderation?: {
    safe: boolean;
    flaggedCategories?: string[];
  };
  vectorEmbeddingId?: string;
  confidenceScore?: number;
  provider?: string;
}

export interface MediaMetadata {
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  extension: string;
  checksum?: string;
  checksums?: MediaChecksums;
  width?: number;
  height?: number;
  dimensions?: MediaDimensions;
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  pageCount?: number;
  encoding?: string;
  colorSpace?: string;
  customFields?: Record<string, string>;
}

export interface MediaVersion {
  versionId: string;
  mediaId: string;
  storageUrl: string;
  storagePath: string;
  metadata: MediaMetadata;
  createdAt: Date;
  createdBy: string;
  note?: string;
}

export interface MediaTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  usageCount?: number;
  createdAt?: Date;
}

export interface MediaCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: MediaType;
  icon?: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaStatistics {
  id: string;
  mediaId: string;
  downloadCount: number;
  playCount: number;
  viewCount: number;
  lastPlayedAt?: Date;
  lastDownloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaPermission {
  mediaId: string;
  visibility: MediaVisibility;
  allowedUserIds: string[];
  requiresAuth: boolean;
}

export interface MediaAsset {
  id: string;
  type: MediaType;
  category: MediaCategory;
  status: MediaStatus;
  uploadStatus?: MediaUploadStatus;
  processingStatus?: MediaProcessingStatus;
  aiStatus?: MediaAiStatus;
  visibility: MediaVisibility;
  folder: MediaFolder;
  storageUrl: string;
  storagePath: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  thumbnails?: MediaThumbnailsMap;
  previews?: MediaPreviewsMap;
  duration?: number;
  dimensions?: MediaDimensions;
  checksums?: MediaChecksums;
  aiMetadata?: MediaAiMetadata;
  metadata: MediaMetadata;
  tags: string[];
  title?: string;
  description?: string;
  altText?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
  permission?: MediaPermission;
  downloadCount?: number;
  playCount?: number;
  viewCount?: number;
  uploadedBy: string;
  uploadedByEmail?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  versions?: MediaVersion[];
  processingJobId?: string;
  expiresAt?: Date;
}

export interface MediaUploadRequest {
  file: File;
  type: MediaType;
  category: MediaCategory;
  folder: MediaFolder;
  title?: string;
  description?: string;
  visibility?: MediaVisibility;
  tags?: string[];
  linkedEntityId?: string;
  linkedEntityType?: string;
  allowDuplicate?: boolean;
  onProgress?: (progress: number) => void;
  onTaskCreated?: (control: UploadTaskControl) => void;
}

export interface MediaUploadResult {
  asset: MediaAsset;
  downloadUrl: string;
  storagePath: string;
  durationMs: number;
}

export const MediaValidationErrorCode = {
  INVALID_MIME_TYPE: 'INVALID_MIME_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_EXTENSION: 'INVALID_EXTENSION',
  INVALID_FILENAME: 'INVALID_FILENAME',
  DUPLICATE_DETECTED: 'DUPLICATE_DETECTED',
  CORRUPT_FILE: 'CORRUPT_FILE',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
} as const;
export type MediaValidationErrorCode = (typeof MediaValidationErrorCode)[keyof typeof MediaValidationErrorCode];

export interface MediaValidationError {
  code: MediaValidationErrorCode;
  message: string;
  field?: string;
}

export interface MediaValidationWarning {
  code: string;
  message: string;
}

export interface MediaValidationResult {
  valid: boolean;
  errors: MediaValidationError[];
  warnings: MediaValidationWarning[];
}

export const MediaProcessingJobType = {
  THUMBNAIL_GENERATION: 'thumbnail_generation',
  COMPRESSION: 'compression',
  FORMAT_CONVERSION: 'format_conversion',
  METADATA_EXTRACTION: 'metadata_extraction',
  VIRUS_SCAN: 'virus_scan',
  WATERMARK: 'watermark',
} as const;
export type MediaProcessingJobType = (typeof MediaProcessingJobType)[keyof typeof MediaProcessingJobType];

export const MediaProcessingJobStatus = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
export type MediaProcessingJobStatus = (typeof MediaProcessingJobStatus)[keyof typeof MediaProcessingJobStatus];

export interface MediaProcessingJob {
  id: string;
  mediaId: string;
  type: MediaProcessingJobType;
  status: MediaProcessingJobStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export const MediaAuditAction = {
  UPLOADED: 'uploaded',
  DELETED: 'deleted',
  RESTORED: 'restored',
  UPDATED: 'updated',
  MOVED: 'moved',
  ARCHIVED: 'archived',
  PERMISSION_CHANGED: 'permission_changed',
  VIEWED: 'viewed',
  DOWNLOADED: 'downloaded',
  PROCESSED: 'processed',
} as const;
export type MediaAuditAction = (typeof MediaAuditAction)[keyof typeof MediaAuditAction];

export interface MediaAuditLog {
  id: string;
  mediaId: string;
  action: MediaAuditAction;
  performedBy: string;
  performedByEmail?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  previousState?: Partial<MediaAsset>;
  newState?: Partial<MediaAsset>;
}

export interface MediaListFilter {
  type?: MediaType;
  category?: MediaCategory;
  status?: MediaStatus;
  visibility?: MediaVisibility;
  folder?: MediaFolder;
  tags?: string[];
  uploadedBy?: string;
  linkedEntityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface MediaListOptions {
  filter?: MediaListFilter;
  sortBy?: 'createdAt' | 'updatedAt' | 'sizeBytes' | 'title';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface MediaPaginatedResult {
  assets: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
