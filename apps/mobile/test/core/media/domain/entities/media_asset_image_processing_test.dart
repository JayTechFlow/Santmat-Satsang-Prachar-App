import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_metadata.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_visibility.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_folder.dart';

void main() {
  group('MediaAsset Sprint M3.2 Image Processing Status Tests', () {
    test('isUploading returns true when status is pending', () {
      final asset = MediaAsset(
        id: 'test_1',
        type: MediaType.image,
        category: MediaCategory.general,
        status: MediaStatus.pending,
        visibility: MediaVisibility.public,
        folder: MediaFolder.images,
        storageUrl: 'https://example.com/test.jpg',
        storagePath: 'images/test.jpg',
        metadata: const MediaMetadata(
          filename: 'test.jpg',
          originalFilename: 'test.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          extension: 'jpg',
          blurHashPlaceholder: 'data:image/svg+xml;base64,...',
        ),
        uploadedBy: 'user_1',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(asset.isUploading, isTrue);
      expect(asset.isProcessing, isFalse);
      expect(asset.isReady, isFalse);
    });

    test('isProcessing returns true when status is processing', () {
      final asset = MediaAsset(
        id: 'test_2',
        type: MediaType.image,
        category: MediaCategory.general,
        status: MediaStatus.processing,
        visibility: MediaVisibility.public,
        folder: MediaFolder.images,
        storageUrl: 'https://example.com/test.jpg',
        storagePath: 'images/test.jpg',
        metadata: const MediaMetadata(
          filename: 'test.jpg',
          originalFilename: 'test.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          extension: 'jpg',
        ),
        uploadedBy: 'user_1',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(asset.isUploading, isFalse);
      expect(asset.isProcessing, isTrue);
      expect(asset.isReady, isFalse);
    });

    test('isReady returns true when status is active and not deleted/expired', () {
      final asset = MediaAsset(
        id: 'test_3',
        type: MediaType.image,
        category: MediaCategory.general,
        status: MediaStatus.active,
        visibility: MediaVisibility.public,
        folder: MediaFolder.images,
        storageUrl: 'https://example.com/test.jpg',
        storagePath: 'images/test.jpg',
        metadata: const MediaMetadata(
          filename: 'test.jpg',
          originalFilename: 'test.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          extension: 'jpg',
        ),
        uploadedBy: 'user_1',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(asset.isUploading, isFalse);
      expect(asset.isProcessing, isFalse);
      expect(asset.isReady, isTrue);
    });
  });
}
