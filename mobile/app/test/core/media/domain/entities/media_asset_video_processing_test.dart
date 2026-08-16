import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_metadata.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_visibility.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_folder.dart';

void main() {
  group('MediaAsset Sprint M3.4 Video Processing Engine Tests', () {
    test('Video MediaMetadata parses resolution, duration, frame rate, codec, and posterUrl', () {
      final meta = MediaMetadata(
        filename: 'satsang_video.mp4',
        originalFilename: 'satsang_video.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 45000000,
        extension: 'mp4',
        width: 1920,
        height: 1080,
        duration: 600.0,
        bitrate: 4500,
        frameRate: 29.97,
        videoCodec: 'H.264 (AVC)',
        posterUrl: 'https://example.com/videos/satsang_poster.jpg',
      );

      expect(meta.width, equals(1920));
      expect(meta.height, equals(1080));
      expect(meta.duration, equals(600.0));
      expect(meta.humanReadableDuration, equals('10m 0s'));
      expect(meta.frameRate, equals(29.97));
      expect(meta.videoCodec, equals('H.264 (AVC)'));
      expect(meta.posterUrl, contains('poster.jpg'));
    });

    test('Video MediaAsset correctly identifies video type and status', () {
      final asset = MediaAsset(
        id: 'video_301',
        type: MediaType.video,
        category: MediaCategory.general,
        status: MediaStatus.active,
        visibility: MediaVisibility.public,
        folder: MediaFolder.videos,
        storageUrl: 'https://example.com/videos/satsang.mp4',
        storagePath: 'videos/satsang.mp4',
        metadata: const MediaMetadata(
          filename: 'satsang.mp4',
          originalFilename: 'satsang.mp4',
          mimeType: 'video/mp4',
          sizeBytes: 50000000,
          extension: 'mp4',
          width: 1280,
          height: 720,
          duration: 300.0,
        ),
        uploadedBy: 'admin_1',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(asset.type, equals(MediaType.video));
      expect(asset.isReady, isTrue);
      expect(asset.isProcessing, isFalse);
    });
  });
}
