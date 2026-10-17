import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import '../../../../helpers/mock_audio_data_source.dart';

List<AudioEntity> _fiftyPublishedTracks() {
  const categories = ['शाही भजनावली', 'पदावली भजन', 'स्वागत गीत', ''];
  return List.generate(50, (i) {
    return AudioEntity(
      id: 'track-${i + 1}',
      title: 'भजन ${i + 1}',
      subtitle: '',
      description: '',
      speaker: 'गायक',
      category: AudioCategoryEntity(
        id: categories[i % categories.length],
        name: categories[i % categories.length].isNotEmpty ? categories[i % categories.length] : 'सभी भजन',
      ),
      duration: const Duration(minutes: 3),
      language: 'हिंदी',
      thumbnailUrl: '',
      artworkUrl: '',
      releaseDate: DateTime(2026, 1, 1),
      playCount: 0,
      favoriteCount: 0,
      isFeatured: false,
      isRecentlyAdded: false,
      isPopular: false,
      audioUrl: 'https://example.com/track-${i + 1}.mp3',
    );
  });
}

class _FiftyTrackSource extends MockAudioDataSource {
  @override
  Future<List<AudioEntity>> getLatestAudio() async => _fiftyPublishedTracks();
}

void main() {
  test(
    'AudioHomeNotifier exposes the complete published catalogue (not a capped page)',
    () async {
      final container = ProviderContainer(
        overrides: [
          audioDataSourceProvider.overrideWithValue(_FiftyTrackSource()),
          audioPlayerProvider.overrideWithValue(null),
        ],
      );
      addTearDown(container.dispose);

      await container.read(audioHomeStateProvider.notifier).loadHomeData();
      final state = container.read(audioHomeStateProvider);

      expect(state.isLoading, false);
      expect(state.error, isNull);
      expect(state.latestAudio, hasLength(50));
      // Order is preserved end to end.
      expect(state.latestAudio.first.id, 'track-1');
      expect(state.latestAudio.last.id, 'track-50');
      expect(
        state.latestAudio.map((a) => a.id).toSet(),
        hasLength(50),
      );
    },
  );

  test(
    'the mobile category model is exactly the four permanent categories',
    () async {
      final container = ProviderContainer(
        overrides: [
          audioDataSourceProvider.overrideWithValue(_FiftyTrackSource()),
          audioPlayerProvider.overrideWithValue(null),
        ],
      );
      addTearDown(container.dispose);

      await container.read(audioHomeStateProvider.notifier).loadHomeData();
      final categories =
          container.read(audioHomeStateProvider).categories;

      expect(
        categories.map((c) => c.id).toList(),
        <String>[
          'allBhajan',
          'shahiBhajanavali',
          'padavaliBhajan',
          'swagatGeet',
        ],
      );
      expect(
        categories.map((c) => c.name).toList(),
        <String>['सभी भजन', 'शाही भजनावली', 'पदावली भजन', 'स्वागत गीत'],
      );
      expect(
        categories.map((c) => c.name),
        isNot(contains('General')),
      );
      expect(
        categories.map((c) => c.name),
        isNot(contains('general')),
      );
    },
  );
}
