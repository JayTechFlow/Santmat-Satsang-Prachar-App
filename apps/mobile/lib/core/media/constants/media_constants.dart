// Enterprise Media Platform — Constants
// Sprint M1 Foundation

import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_folder.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';

class MediaConstants {
  MediaConstants._();

  // Firestore collections
  static const String mediaCollection = 'media';
  static const String mediaVersionsCollection = 'media_versions';
  static const String mediaProcessingJobsCollection = 'media_processing_jobs';
  static const String mediaTagsCollection = 'media_tags';
  static const String mediaAuditCollection = 'media_audit';

  // Storage folder paths
  static const Map<MediaFolder, String> folderPaths = {
    MediaFolder.audio: 'audio',
    MediaFolder.books: 'books',
    MediaFolder.banners: 'banners',
    MediaFolder.images: 'images',
    MediaFolder.videos: 'videos',
    MediaFolder.avatars: 'avatars',
    MediaFolder.documents: 'documents',
    MediaFolder.events: 'events',
    MediaFolder.exports: 'exports',
    MediaFolder.temp: 'temp',
    MediaFolder.processing: 'processing',
    MediaFolder.backups: 'backups',
  };

  // Size limits in bytes
  static const Map<MediaType, int> maxSizeBytes = {
    MediaType.image: 5 * 1024 * 1024,    // 5 MB
    MediaType.banner: 5 * 1024 * 1024,   // 5 MB
    MediaType.audio: 50 * 1024 * 1024,   // 50 MB
    MediaType.pdf: 20 * 1024 * 1024,     // 20 MB
    MediaType.video: 500 * 1024 * 1024,  // 500 MB
    MediaType.document: 20 * 1024 * 1024, // 20 MB
  };

  // Allowed MIME types
  static const Map<MediaType, List<String>> allowedMimeTypes = {
    MediaType.image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    MediaType.banner: ['image/jpeg', 'image/png', 'image/webp'],
    MediaType.audio: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a'],
    MediaType.pdf: ['application/pdf'],
    MediaType.video: ['video/mp4', 'video/webm', 'video/quicktime'],
    MediaType.document: ['application/pdf', 'application/msword', 'text/plain'],
  };

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Content limits
  static const int maxTitleLength = 200;
  static const int maxDescriptionLength = 2000;
  static const int maxTagsPerAsset = 10;
}
