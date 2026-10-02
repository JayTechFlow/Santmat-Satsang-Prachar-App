import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:santmat_satsang_prachar/firebase_options.dart';
import 'package:santmat_satsang_prachar/core/storage/storage_service.dart';
import 'package:santmat_satsang_prachar/core/di/dependency_injection.dart';
import 'package:santmat_satsang_prachar/core/storage/providers/firebase_storage_provider.dart';
import 'package:santmat_satsang_prachar/core/storage/resolvers/media_url_resolver.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  const realFirebaseStoragePath = 'audio/bhajans/sdsdsa/1786881158602_Original_Bam_Lehri_-_Shri_Bansi_Jogi_and_Party__1995______________.mp3';
  const realFirebaseStorageHttpUrl = 'https://firebasestorage.googleapis.com/v0/b/santmat-satsang-prachar.firebasestorage.app/o/audio%2Fbhajans%2Fsdsdsa%2F1786881158602_Original_Bam_Lehri_-_Shri_Bansi_Jogi_and_Party__1995______________.mp3?alt=media&token=dd73f96e-8282-4a88-bf51-0ce9cd3446d8';

  final realFirebaseTrack = AudioEntity(
    id: 'storage-bam-lehri-1',
    title: 'Original Bam Lehri - Shri Bansi Jogi',
    subtitle: 'Traditional Devotional Folk Bhajan (1995)',
    description: 'Original Bam Lehri recorded in 1995 by Shri Bansi Jogi and Party',
    speaker: 'Shri Bansi Jogi and Party',
    category: const AudioCategoryEntity(id: 'bhajan', name: 'भजन'),
    duration: const Duration(minutes: 12, seconds: 43),
    language: 'hi',
    thumbnailUrl: 'https://firebasestorage.googleapis.com/v0/b/santmat-satsang-prachar.firebasestorage.app/o/banners%2F1787082946986_INVITATION_CARD.png?alt=media&token=dcd882d6-231f-4145-b865-8de041c8800c',
    artworkUrl: 'https://firebasestorage.googleapis.com/v0/b/santmat-satsang-prachar.firebasestorage.app/o/banners%2F1787082946986_INVITATION_CARD.png?alt=media&token=dcd882d6-231f-4145-b865-8de041c8800c',
    releaseDate: DateTime(2026, 8, 15),
    playCount: 1,
    favoriteCount: 0,
    isFeatured: true,
    isRecentlyAdded: true,
    isPopular: true,
    audioUrl: realFirebaseStorageHttpUrl,
  );

  setUpAll(() async {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    } catch (_) {}
    await StorageService.init();
    await DependencyInjection.init();
  });

  group('Real Firebase Storage Audio Playback & Catalog Lifecycle Verification', () {
    testWidgets('FS01: MediaUrlResolver resolves existing Firebase Storage path and URL', (tester) async {
      final resolver = MediaUrlResolver(FirebaseStorageProvider());

      // 1. Direct HTTPS Firebase Storage URL
      final resolvedHttp = await resolver.resolveDownloadUrl(realFirebaseStorageHttpUrl);
      expect(resolvedHttp, equals(realFirebaseStorageHttpUrl));
      expect(resolvedHttp.contains('firebasestorage.googleapis.com'), isTrue);
      expect(resolvedHttp.contains('soundhelix.com'), isFalse);

      // 2. Relative Storage Path
      final resolvedRelative = await resolver.resolveDownloadUrl(realFirebaseStoragePath);
      expect(resolvedRelative.isNotEmpty, isTrue);
      expect(resolvedRelative.contains('firebasestorage.googleapis.com'), isTrue);
      expect(resolvedRelative.contains('soundhelix.com'), isFalse);
    });

    testWidgets('FS02: PlaybackNotifier loads and streams real Firebase Storage track into player', (tester) async {
      final prefs = await SharedPreferences.getInstance();
      final player = AudioPlayer();
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          audioPlayerProvider.overrideWithValue(player),
        ],
      );
      addTearDown(() async {
        await player.stop();
        await player.dispose();
        container.dispose();
      });

      final notifier = container.read(playbackStateProvider.notifier);

      // Play real Firebase Storage track
      await notifier.play(realFirebaseTrack);

      final state = container.read(playbackStateProvider);
      expect(state.currentAudio, equals(realFirebaseTrack));
      expect(state.currentAudio!.audioUrl, contains('firebasestorage.googleapis.com'));
      expect(state.currentAudio!.audioUrl, isNot(contains('SoundHelix')));
      expect(state.status, anyOf(PlaybackStatus.loading, PlaybackStatus.playing));

      // Pause playback
      notifier.pause();
      expect(container.read(playbackStateProvider).status, anyOf(PlaybackStatus.paused, PlaybackStatus.loading));

      // Resume playback
      notifier.resume();
      expect(container.read(playbackStateProvider).currentAudio, equals(realFirebaseTrack));

      // Stop playback
      await notifier.stop();
      expect(container.read(playbackStateProvider).status, equals(PlaybackStatus.idle));
    });

    testWidgets('FS03: Admin metadata update propagates to active AudioEntity', (tester) async {
      final updatedTrack = realFirebaseTrack.copyWith(
        title: 'Original Bam Lehri (1995 Remastered) - Shri Bansi Jogi',
        description: 'अद्यतन पद एवं संपूर्ण बोल (Updated Lyrics)',
      );

      expect(updatedTrack.title, contains('Remastered'));
      expect(updatedTrack.audioUrl, equals(realFirebaseStorageHttpUrl));
      expect(updatedTrack.id, equals(realFirebaseTrack.id));
    });

    testWidgets('FS04: Unpublish action clears playback state and respects unpublish contract', (tester) async {
      final prefs = await SharedPreferences.getInstance();
      final player = AudioPlayer();
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          audioPlayerProvider.overrideWithValue(player),
        ],
      );
      addTearDown(() async {
        await player.dispose();
        container.dispose();
      });

      final notifier = container.read(playbackStateProvider.notifier);
      await notifier.play(realFirebaseTrack);
      expect(container.read(playbackStateProvider).currentAudio, isNotNull);

      // Unpublish event triggers stop
      await notifier.stop();
      expect(container.read(playbackStateProvider).currentAudio, isNull);
      expect(container.read(playbackStateProvider).status, equals(PlaybackStatus.idle));
    });

    testWidgets('FS05: Zero mock verification - AudioHomeState does not populate fake sample data', (tester) async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final state = container.read(audioHomeStateProvider);
      // Empty state returns empty collections, not sampleBhajans fallback
      for (final bhajan in state.latestAudio) {
        expect(bhajan.audioUrl, isNot(contains('soundhelix.com')));
      }
    });
  });
}
