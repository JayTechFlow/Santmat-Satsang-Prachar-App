import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:santmat_satsang_prachar/firebase_options.dart';
import 'package:santmat_satsang_prachar/core/storage/storage_service.dart';
import 'package:santmat_satsang_prachar/core/di/dependency_injection.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'helpers/sample_bhajans.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    } catch (_) {
      // Already initialized in test environment
    }
    await StorageService.init();
    await DependencyInjection.init();
  });

  group('Wave 2: Real Audio Playback Integration', () {
    testWidgets('PA01: Real AudioPlayer play sets currentAudio and loading status', (tester) async {
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
      await notifier.play(sampleBhajans[0]);

      final state = container.read(playbackStateProvider);
      expect(state.currentAudio, equals(sampleBhajans[0]));
      expect(
        state.status,
        anyOf(equals(PlaybackStatus.loading), equals(PlaybackStatus.playing)),
      );
    });

    testWidgets('PA02: Real AudioPlayer pause sets status to paused', (tester) async {
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

      await container.read(playbackStateProvider.notifier).play(sampleBhajans[0]);

      container.read(playbackStateProvider.notifier).pause();
      final state = container.read(playbackStateProvider);

      expect(state.status, equals(PlaybackStatus.paused));
      expect(state.currentAudio, equals(sampleBhajans[0]));
    });

    testWidgets('PA03: Real AudioPlayer resume sets status to playing', (tester) async {
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

      await container.read(playbackStateProvider.notifier).play(sampleBhajans[0]);
      container.read(playbackStateProvider.notifier).pause();

      container.read(playbackStateProvider.notifier).resume();
      final state = container.read(playbackStateProvider);

      expect(state.status, equals(PlaybackStatus.playing));
      expect(state.currentAudio, equals(sampleBhajans[0]));
    });

    testWidgets('PA04: Real AudioPlayer seek updates position', (tester) async {
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

      await container.read(playbackStateProvider.notifier).play(sampleBhajans[0]);

      final notifier = container.read(playbackStateProvider.notifier);
      notifier.seekTo(const Duration(seconds: 30));

      final state = container.read(playbackStateProvider);
      expect(state.position, greaterThanOrEqualTo(const Duration(seconds: 20)));
      expect(state.position, lessThanOrEqualTo(const Duration(seconds: 40)));
    });

    testWidgets('PA05: Real AudioPlayer playNext advances queue', (tester) async {
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

      await container.read(playbackStateProvider.notifier).replaceQueue(sampleBhajans, initialIndex: 0);

      await container.read(playbackStateProvider.notifier).playNext();
      final state = container.read(playbackStateProvider);
      expect(state.currentAudio, equals(sampleBhajans[1]));
    });

    testWidgets('PA06: Real AudioPlayer playPrevious goes back in queue', (tester) async {
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

      await container.read(playbackStateProvider.notifier).replaceQueue(sampleBhajans, initialIndex: 2);

      await container.read(playbackStateProvider.notifier).playPrevious();
      final state = container.read(playbackStateProvider);
      expect(state.currentAudio, equals(sampleBhajans[1]));
    });

    testWidgets('PA07: Real AudioPlayer replaceQueue replaces queue', (tester) async {
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
      final newQueue = sampleBhajans.sublist(0, 2);

      await notifier.replaceQueue(newQueue, initialIndex: 0);
      final state = container.read(playbackStateProvider);
      expect(state.currentAudio, equals(newQueue[0]));
    });

    testWidgets('PA08: Real AudioPlayer stop clears state', (tester) async {
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

      await container.read(playbackStateProvider.notifier).play(sampleBhajans[0]);

      await container.read(playbackStateProvider.notifier).stop();
      final state = container.read(playbackStateProvider);
      expect(state.currentAudio, isNull);
      expect(state.status, equals(PlaybackStatus.idle));
    });

    testWidgets('PA09: Real AudioPlayer error state then retry recovers', (tester) async {
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

      final invalidAudio = AudioEntity(
        id: 'invalid',
        title: 'Invalid Audio',
        subtitle: '',
        description: '',
        speaker: '',
        category: sampleCategoryPadavali,
        duration: Duration.zero,
        language: 'en',
        thumbnailUrl: '',
        artworkUrl: '',
        releaseDate: DateTime(2026),
        playCount: 0,
        favoriteCount: 0,
        isFeatured: false,
        isRecentlyAdded: false,
        isPopular: false,
        audioUrl: 'https://nonexistent.invalid/audio.mp3',
      );

      await notifier.play(invalidAudio);
      final errorState = container.read(playbackStateProvider);
      expect(errorState.status, equals(PlaybackStatus.error));

      await notifier.play(sampleBhajans[0]);
      final retryState = container.read(playbackStateProvider);
      expect(retryState.currentAudio, equals(sampleBhajans[0]));
    });

    testWidgets('PA10: Real AudioPlayer cross-content switch updates currentAudio', (tester) async {
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

      await container.read(playbackStateProvider.notifier).play(sampleBhajans[0]);

      final beforeSwitchState = container.read(playbackStateProvider);

      await container.read(playbackStateProvider.notifier).play(sampleBhajans[1]);
      final afterSwitchState = container.read(playbackStateProvider);

      expect(afterSwitchState.currentAudio, equals(sampleBhajans[1]));
      expect(afterSwitchState.currentAudio, isNot(equals(beforeSwitchState.currentAudio)));
    });

    testWidgets('PA11: Real AudioPlayer rapid command sequence completes', (tester) async {
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

      await notifier.play(sampleBhajans[0]);
      notifier.playNext();
      notifier.playNext();
      notifier.pause();
      await notifier.play(sampleBhajans[0]);
      notifier.seekTo(const Duration(seconds: 15));
      notifier.playNext();
      notifier.playPrevious();
      await Future.delayed(const Duration(milliseconds: 100));

      final finalState = container.read(playbackStateProvider);
      expect(finalState.currentAudio, isNotNull);
      expect(finalState.status, equals(PlaybackStatus.playing));
    });

    testWidgets('PA12: Real AudioPlayer lifecycle sets currentAudio correctly', (tester) async {
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

      await container.read(playbackStateProvider.notifier).play(sampleBhajans[0]);
      final state = container.read(playbackStateProvider);
      expect(state.currentAudio, equals(sampleBhajans[0]));
    });
  });
}
