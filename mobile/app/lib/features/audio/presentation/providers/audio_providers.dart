import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/audio_usecases.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import 'audio_state.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final getLatestAudioUseCaseProvider = Provider(
  (ref) => GetLatestAudioUseCase(ref.watch(audioRepositoryProvider)),
);
final getFeaturedAudioUseCaseProvider = Provider(
  (ref) => GetFeaturedAudioUseCase(ref.watch(audioRepositoryProvider)),
);
final getPopularAudioUseCaseProvider = Provider(
  (ref) => GetPopularAudioUseCase(ref.watch(audioRepositoryProvider)),
);
final getAudioCategoriesUseCaseProvider = Provider(
  (ref) => GetAudioCategoriesUseCase(ref.watch(audioRepositoryProvider)),
);
final getRecentlyPlayedUseCaseProvider = Provider(
  (ref) => GetRecentlyPlayedUseCase(ref.watch(audioRepositoryProvider)),
);
final getAudioDetailsUseCaseProvider = Provider(
  (ref) => GetAudioDetailsUseCase(ref.watch(audioRepositoryProvider)),
);
final getFavoritesUseCaseProvider = Provider(
  (ref) => GetFavoritesUseCase(ref.watch(audioRepositoryProvider)),
);
final toggleFavoriteAudioUseCaseProvider = Provider(
  (ref) => ToggleFavoriteAudioUseCase(ref.watch(audioRepositoryProvider)),
);

class AudioHomeNotifier extends Notifier<AudioHomeState> {
  bool _mounted = true;

  @override
  AudioHomeState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadHomeData();
    });
    return const AudioHomeState(isLoading: true);
  }

  Future<void> loadHomeData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final getFeatured = ref.read(getFeaturedAudioUseCaseProvider);
      final getLatest = ref.read(getLatestAudioUseCaseProvider);
      final getPopular = ref.read(getPopularAudioUseCaseProvider);
      final getCategories = ref.read(getAudioCategoriesUseCaseProvider);
      final getRecently = ref.read(getRecentlyPlayedUseCaseProvider);

      final results = await Future.wait([
        getFeatured(),
        getLatest(),
        getPopular(),
        getCategories(),
        getRecently(),
      ]);

      if (!_mounted) return;

      final featured = results[0];
      final latest = results[1];
      final popular = results[2];
      final categories = results[3];
      final recentlyPlayed = results[4];

      if (featured.isError) throw Exception(featured.error);
      if (latest.isError) throw Exception(latest.error);
      if (popular.isError) throw Exception(popular.error);
      if (categories.isError) throw Exception(categories.error);
      if (recentlyPlayed.isError) throw Exception(recentlyPlayed.error);

      state = state.copyWith(
        isLoading: false,
        featuredAudio: featured.data as List<AudioEntity>,
        latestAudio: latest.data as List<AudioEntity>,
        popularAudio: popular.data as List<AudioEntity>,
        categories: categories.data as List<AudioCategoryEntity>,
        recentlyPlayed: recentlyPlayed.data as List<RecentlyPlayedEntity>,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final audioHomeStateProvider =
    NotifierProvider<AudioHomeNotifier, AudioHomeState>(AudioHomeNotifier.new);

final audioDetailsProvider = FutureProvider.family<AudioEntity, String>((
  ref,
  id,
) async {
  final res = await ref.read(getAudioDetailsUseCaseProvider).call(id);
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

class PlaybackNotifier extends Notifier<PlaybackStateEntity> {
  @override
  PlaybackStateEntity build() {
    return const PlaybackStateEntity();
  }

  void play(AudioEntity audio) {
    state = state.copyWith(currentAudio: audio, status: PlaybackStatus.playing);
  }

  void pause() {
    state = state.copyWith(status: PlaybackStatus.paused);
  }

  void resume() {
    state = state.copyWith(status: PlaybackStatus.playing);
  }

  void stop() {
    state = const PlaybackStateEntity();
  }

  void toggleShuffle() {
    state = state.copyWith(isShuffleEnabled: !state.isShuffleEnabled);
  }

  void toggleRepeat() {
    state = state.copyWith(isRepeatEnabled: !state.isRepeatEnabled);
  }
}

final playbackStateProvider =
    NotifierProvider<PlaybackNotifier, PlaybackStateEntity>(
      PlaybackNotifier.new,
    );

final favoritesProvider = FutureProvider<List<FavoriteAudioEntity>>((
  ref,
) async {
  final res = await ref.read(getFavoritesUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});
