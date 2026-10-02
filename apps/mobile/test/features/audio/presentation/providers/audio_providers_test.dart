import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import '../../../../helpers/mock_audio_data_source.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

void main() {
  List<AudioEntity> playbackQueue() {
    const category = AudioCategoryEntity(id: 'test', name: 'Test');
    return [
      AudioEntity(
        id: 'queue-1',
        title: 'Queue Audio 1',
        subtitle: 'Subtitle 1',
        description: 'Description 1',
        speaker: 'Speaker',
        category: category,
        duration: const Duration(minutes: 1),
        language: 'Hindi',
        thumbnailUrl: '',
        artworkUrl: '',
        releaseDate: DateTime(2026),
        playCount: 0,
        favoriteCount: 0,
        isFeatured: false,
        isRecentlyAdded: false,
        isPopular: false,
        audioUrl: 'https://test.com/1.mp3',
      ),
      AudioEntity(
        id: 'queue-2',
        title: 'Queue Audio 2',
        subtitle: 'Subtitle 2',
        description: 'Description 2',
        speaker: 'Speaker',
        category: category,
        duration: const Duration(minutes: 2),
        language: 'Hindi',
        thumbnailUrl: '',
        artworkUrl: '',
        releaseDate: DateTime(2026, 1, 2),
        playCount: 0,
        favoriteCount: 0,
        isFeatured: false,
        isRecentlyAdded: false,
        isPopular: false,
        audioUrl: 'https://test.com/2.mp3',
      ),
    ];
  }

  test('AudioHomeNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        audioDataSourceProvider.overrideWithValue(MockAudioDataSource()),
        audioPlayerProvider.overrideWithValue(null),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(audioHomeStateProvider);
    expect(state.isLoading, true);

    await container.read(audioHomeStateProvider.notifier).loadHomeData();
    state = container.read(audioHomeStateProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.featuredAudio, isNotEmpty);
    expect(state.latestAudio, isNotEmpty);
    expect(state.popularAudio, isNotEmpty);
    expect(state.categories, isNotEmpty);
    expect(state.recentlyPlayed, isNotEmpty);
  });

  test('PlaybackNotifier manages state correctly', () async {
    final container = ProviderContainer(
      overrides: [audioPlayerProvider.overrideWithValue(null)],
    );
    addTearDown(container.dispose);

    var state = container.read(playbackStateProvider);
    expect(state.status, PlaybackStatus.idle);
    expect(state.isShuffleEnabled, false);
    expect(state.isRepeatEnabled, false);

    container.read(playbackStateProvider.notifier).toggleShuffle();
    state = container.read(playbackStateProvider);
    expect(state.isShuffleEnabled, true);

    container.read(playbackStateProvider.notifier).toggleRepeat();
    state = container.read(playbackStateProvider);
    expect(state.isRepeatEnabled, true);
  });

  test(
    'PlaybackNotifier owns queue replacement and indexed playback',
    () async {
      final container = ProviderContainer(
        overrides: [audioPlayerProvider.overrideWithValue(null)],
      );
      addTearDown(container.dispose);

      final notifier = container.read(playbackStateProvider.notifier);
      final audio = playbackQueue();

      await notifier.replaceQueue(audio, initialIndex: 1);
      var state = container.read(playbackStateProvider);
      expect(state.currentAudio, audio[1]);
      expect(state.status, PlaybackStatus.loading);
      expect(notifier.queue, audio);
      expect(notifier.currentIndex, 1);

      await notifier.playFromIndex(0);
      state = container.read(playbackStateProvider);
      expect(state.currentAudio, audio[0]);
      expect(notifier.currentIndex, 0);
    },
  );

  test('PlaybackNotifier stop clears authoritative playback state', () async {
    final container = ProviderContainer(
      overrides: [audioPlayerProvider.overrideWithValue(null)],
    );
    addTearDown(container.dispose);

    final notifier = container.read(playbackStateProvider.notifier);
    final audio = playbackQueue().first;

    await notifier.play(audio);
    expect(container.read(playbackStateProvider).currentAudio, audio);

    await notifier.stop();
    final state = container.read(playbackStateProvider);
    expect(state.currentAudio, isNull);
    expect(state.status, PlaybackStatus.idle);
  });
}
