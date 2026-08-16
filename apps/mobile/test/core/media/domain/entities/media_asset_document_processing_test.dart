import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_metadata.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_visibility.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_folder.dart';

void main() {
  group('MediaAsset Sprint M3.5 Document Processing Engine Tests', () {
    test('Document MediaMetadata parses page count, author, category, and security flags', () {
      final meta = const MediaMetadata(
        filename: 'satsang_parichay.pdf',
        originalFilename: 'satsang_parichay.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2500000,
        extension: 'pdf',
        pageCount: 32,
        author: 'Santmat Satsang Prachar Library',
        documentCategory: 'pdf',
        isEncrypted: false,
        previewUrl: 'https://example.com/docs/satsang_parichay_thumb.png',
      );

      expect(meta.pageCount, equals(32));
      expect(meta.author, equals('Santmat Satsang Prachar Library'));
      expect(meta.documentCategory, equals('pdf'));
      expect(meta.isEncrypted, isFalse);
      expect(meta.previewUrl, contains('_thumb.png'));
    });

    test('Document MediaAsset correctly identifies document type and status', () {
      final asset = MediaAsset(
        id: 'doc_401',
        type: MediaType.document,
        category: MediaCategory.book,
        status: MediaStatus.active,
        visibility: MediaVisibility.public,
        folder: MediaFolder.documents,
        storageUrl: 'https://example.com/docs/book.pdf',
        storagePath: 'documents/book.pdf',
        metadata: const MediaMetadata(
          filename: 'book.pdf',
          originalFilename: 'book.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1500000,
          extension: 'pdf',
          pageCount: 15,
        ),
        uploadedBy: 'admin_1',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(asset.type, equals(MediaType.document));
      expect(asset.isReady, isTrue);
      expect(asset.isProcessing, isFalse);
    });
  });
}
