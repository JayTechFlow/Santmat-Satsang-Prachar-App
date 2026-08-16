import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_metadata.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_visibility.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_folder.dart';

void main() {
  group('MediaAsset Sprint M3.3 Audio Processing Engine Tests', () {
    test('Audio MediaMetadata parses duration, bitrate, waveform points, and streaming preview', () {
      final meta = MediaMetadata(
        filename: 'bhajan_satsang.mp3',
        originalFilename: 'bhajan_satsang.mp3',
        mimeType: 'audio/mpeg',
        sizeBytes: 8500000,
        extension: 'mp3',
        duration: 240.0,
        bitrate: 320,
        sampleRate: 44100,
        streamingPreviewUrl: 'https://example.com/audio/bhajan.mp3#t=0,30',
        waveformPoints: [0.1, 0.4, 0.8, 0.9, 0.6, 0.3, 0.7, 0.5],
      );

      expect(meta.duration, equals(240.0));
      expect(meta.humanReadableDuration, equals('4m 0s'));
      expect(meta.bitrate, equals(320));
      expect(meta.waveformPoints?.length, equals(8));
      expect(meta.streamingPreviewUrl, contains('#t=0,30'));
    });

    test('Audio MediaAsset correctly identifies audio type and status', () {
      final asset = MediaAsset(
        id: 'audio_101',
        type: MediaType.audio,
        category: MediaCategory.bhajan,
        status: MediaStatus.active,
        visibility: MediaVisibility.public,
        folder: MediaFolder.audio,
        storageUrl: 'https://example.com/audio/bhajan.mp3',
        storagePath: 'audio/bhajan.mp3',
        metadata: const MediaMetadata(
          filename: 'bhajan.mp3',
          originalFilename: 'bhajan.mp3',
          mimeType: 'audio/mpeg',
          sizeBytes: 5000000,
          extension: 'mp3',
          duration: 180.0,
        ),
        uploadedBy: 'admin_1',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(asset.type, equals(MediaType.audio));
      expect(asset.isReady, isTrue);
      expect(asset.isProcessing, isFalse);
    });
  });
}
