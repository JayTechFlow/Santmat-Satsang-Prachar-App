import { MediaFolder, MediaType } from '../types/media.types';

export const MEDIA_FOLDER_PATHS: Record<MediaFolder, string> = {
  [MediaFolder.AUDIO]: 'audio',
  [MediaFolder.BOOKS]: 'books',
  [MediaFolder.BANNERS]: 'banners',
  [MediaFolder.IMAGES]: 'images',
  [MediaFolder.VIDEOS]: 'videos',
  [MediaFolder.AVATARS]: 'avatars',
  [MediaFolder.DOCUMENTS]: 'documents',
  [MediaFolder.EVENTS]: 'events',
  [MediaFolder.EXPORTS]: 'exports',
  [MediaFolder.TEMP]: 'temp',
  [MediaFolder.PROCESSING]: 'processing',
  [MediaFolder.BACKUPS]: 'backups',
};

export const MEDIA_FIRESTORE_COLLECTIONS = {
  MEDIA: 'media',
  MEDIA_VERSIONS: 'media_versions',
  MEDIA_JOBS: 'media_jobs',
  MEDIA_PROCESSING_JOBS: 'media_jobs',
  MEDIA_TAGS: 'media_tags',
  MEDIA_CATEGORIES: 'media_categories',
  MEDIA_AUDIT: 'media_audit',
  MEDIA_STATISTICS: 'media_statistics',
} as const;

export const AUDIO_MAX_UPLOAD_BYTES = 512 * 1024 * 1024; // 512 MB

export const MEDIA_SIZE_LIMITS: Record<MediaType, number> = {
  [MediaType.IMAGE]: 5 * 1024 * 1024,
  [MediaType.BANNER]: 5 * 1024 * 1024,
  [MediaType.AUDIO]: AUDIO_MAX_UPLOAD_BYTES,
  [MediaType.PDF]: 20 * 1024 * 1024,
  [MediaType.VIDEO]: 500 * 1024 * 1024,
  [MediaType.DOCUMENT]: 20 * 1024 * 1024,
};

export const MEDIA_ACCEPTED_MIME_TYPES = {
  IMAGE: 'image/jpeg,image/png,image/webp,image/gif',
  AUDIO: 'audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/aac,audio/x-m4a',
  PDF: 'application/pdf',
  VIDEO: 'video/mp4,video/webm,video/quicktime',
} as const;

export const MEDIA_DEFAULT_CACHE_CONTROL = 'public,max-age=31536000';
export const MEDIA_TEMP_CACHE_CONTROL = 'private,no-cache';

export const MEDIA_MAX_TAGS_PER_ASSET = 10;
export const MEDIA_MAX_TITLE_LENGTH = 200;
export const MEDIA_MAX_DESCRIPTION_LENGTH = 2000;
export const MEDIA_MAX_FILENAME_LENGTH = 200;

export const MEDIA_PAGINATION_DEFAULT_PAGE_SIZE = 20;
export const MEDIA_PAGINATION_MAX_PAGE_SIZE = 100;
