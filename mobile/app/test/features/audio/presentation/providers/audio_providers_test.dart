import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/data/datasources/mock_audio_data_source.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

void main() {
  test('AudioHomeNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        audioDataSourceProvider.overrideWithValue(MockAudioDataSource()),
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

  test('PlaybackNotifier manages state correctly', () {
    final container = ProviderContainer();
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
}
