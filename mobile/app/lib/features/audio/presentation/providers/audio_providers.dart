import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/media/presentation/providers/media_providers.dart';
import '../../domain/usecases/audio_usecases.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import 'audio_state.dart';

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
      if (!_mounted) return;
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final audioHomeStateProvider =
    NotifierProvider<AudioHomeNotifier, AudioHomeState>(AudioHomeNotifier.new);

final audioPlayerProvider = Provider<AudioPlayer?>((ref) {
  final player = AudioPlayer();
  ref.onDispose(() => player.dispose());
  return player;
});

final audioDetailsProvider = FutureProvider.family<AudioEntity, String>((
  ref,
  id,
) async {
  final res = await ref.read(getAudioDetailsUseCaseProvider).call(id);
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

class PlaybackNotifier extends Notifier<PlaybackStateEntity> {
  AudioPlayer? _player;
  bool _isActive = true;
  int _requestId = 0;
  List<AudioEntity> _queue = [];
  int _currentIndex = -1;

  List<AudioEntity> get queue => List.unmodifiable(_queue);
  int get currentIndex => _currentIndex;

  @override
  PlaybackStateEntity build() {
    _player = ref.watch(audioPlayerProvider);
    _isActive = true;

    if (_player != null) {
      final posSub = _player!.positionStream.listen((pos) {
        state = state.copyWith(position: pos);
      });

      final bufSub = _player!.bufferedPositionStream.listen((buf) {
        state = state.copyWith(buffered: buf);
      });

      final stateSub = _player!.playerStateStream.listen((playerState) {
        if (playerState.processingState == ProcessingState.completed) {
          state = state.copyWith(status: PlaybackStatus.completed, position: Duration.zero);
          if (state.currentAudio != null) {
            ref.read(playbackAnalyticsServiceProvider).logMediaComplete(
                  id: state.currentAudio!.id,
                  duration: _player?.duration ?? Duration.zero,
                );
          }
          // Auto advance next track in queue if available
          playNext();
        } else if (playerState.playing) {
          state = state.copyWith(status: PlaybackStatus.playing);
        } else if (playerState.processingState == ProcessingState.ready) {
          if (!playerState.playing && state.status == PlaybackStatus.playing) {
            state = state.copyWith(status: PlaybackStatus.paused);
          }
        }
      });

      ref.onDispose(() {
        _isActive = false;
        posSub.cancel();
        bufSub.cancel();
        stateSub.cancel();
      });
    }

    return const PlaybackStateEntity();
  }

  /// Sets full queue/playlist and plays item at target index.
  Future<void> setQueue(List<AudioEntity> playlist, {int initialIndex = 0}) async {
    _queue = List.from(playlist);
    if (_queue.isEmpty) return;
    _currentIndex = (initialIndex >= 0 && initialIndex < _queue.length) ? initialIndex : 0;
    await play(_queue[_currentIndex]);
  }

  Future<void> play(AudioEntity audio, {bool forceRefreshUrl = false}) async {
    final currentReqId = ++_requestId;
    state = state.copyWith(
      currentAudio: audio,
      status: PlaybackStatus.loading,
      errorMessage: null,
    );

    if (_queue.isEmpty || !_queue.any((element) => element.id == audio.id)) {
      _queue = [audio];
      _currentIndex = 0;
    } else {
      _currentIndex = _queue.indexWhere((element) => element.id == audio.id);
    }

    if (_player == null) return;

    try {
      final offlineService = ref.read(offlineMediaServiceProvider);
      final urlResolver = ref.read(mediaUrlResolverProvider);
      
      File? localFile = offlineService.getDownloadedFile(audio.id);
      Uri audioUri;

      if (localFile != null && localFile.existsSync()) {
        audioUri = Uri.file(localFile.path);
      } else {
        final resolvedUrlStr = await urlResolver.resolveDownloadUrl(
          audio.audioUrl,
          forceRefresh: forceRefreshUrl,
        );
        audioUri = Uri.parse(resolvedUrlStr);
      }

      Uri? artUri;
      if (audio.thumbnailUrl.isNotEmpty) {
        final resolvedArtUrl = await urlResolver.resolveThumbnailUrl(audio.thumbnailUrl);
        if (resolvedArtUrl.startsWith('http://') || resolvedArtUrl.startsWith('https://')) {
          artUri = Uri.parse(resolvedArtUrl);
        }
      }

      final mediaItem = MediaItem(
        id: audio.id,
        album: audio.category.name,
        title: audio.title,
        artist: audio.speaker,
        artUri: artUri,
      );

      await _player!.setAudioSource(
        AudioSource.uri(audioUri, tag: mediaItem),
      );

      if (!_isActive || currentReqId != _requestId) return;

      state = state.copyWith(status: PlaybackStatus.playing);
      _player!.play();

      ref.read(playbackAnalyticsServiceProvider).logMediaPlay(
            id: audio.id,
            title: audio.title,
            mediaType: 'audio',
            category: audio.category.name,
          );
    } catch (e) {
      if (!forceRefreshUrl) {
        // Automatic signed URL refresh retry on failure
        return play(audio, forceRefreshUrl: true);
      }

      state = state.copyWith(
        status: PlaybackStatus.error,
        errorMessage: 'Playback error: $e',
      );

      ref.read(playbackAnalyticsServiceProvider).logMediaError(
            id: audio.id,
            error: e.toString(),
          );
    }
  }

  void pause() {
    state = state.copyWith(status: PlaybackStatus.paused);
    _player?.pause();
    if (state.currentAudio != null) {
      ref.read(playbackAnalyticsServiceProvider).logMediaPause(
            id: state.currentAudio!.id,
            position: state.position,
          );
    }
  }

  void resume() {
    state = state.copyWith(status: PlaybackStatus.playing);
    _player?.play();
    if (state.currentAudio != null) {
      ref.read(playbackAnalyticsServiceProvider).logMediaPlay(
            id: state.currentAudio!.id,
            title: state.currentAudio!.title,
            mediaType: 'audio',
            category: state.currentAudio!.category.name,
          );
    }
  }

  void stop() {
    state = const PlaybackStateEntity();
    _player?.stop();
  }

  void toggleShuffle() {
    final nextState = !state.isShuffleEnabled;
    state = state.copyWith(isShuffleEnabled: nextState);
    _player?.setShuffleModeEnabled(nextState);
  }

  void toggleRepeat() {
    final nextState = !state.isRepeatEnabled;
    state = state.copyWith(isRepeatEnabled: nextState);
    _player?.setLoopMode(nextState ? LoopMode.one : LoopMode.off);
  }

  void seekTo(Duration position) {
    state = state.copyWith(position: position);
    _player?.seek(position);
    if (state.currentAudio != null) {
      ref.read(playbackAnalyticsServiceProvider).logMediaSeek(
            id: state.currentAudio!.id,
            targetPosition: position,
          );
    }
  }

  void playNext([List<AudioEntity>? playlist]) {
    final list = playlist ?? _queue;
    if (list.isEmpty || state.currentAudio == null) return;
    final index = list.indexWhere((a) => a.id == state.currentAudio!.id);
    if (index != -1 && index < list.length - 1) {
      play(list[index + 1]);
    } else if (state.isRepeatEnabled && list.isNotEmpty) {
      play(list.first);
    }
  }

  void playPrevious([List<AudioEntity>? playlist]) {
    final list = playlist ?? _queue;
    if (list.isEmpty || state.currentAudio == null) return;
    final index = list.indexWhere((a) => a.id == state.currentAudio!.id);
    if (index > 0) {
      play(list[index - 1]);
    } else if (state.isRepeatEnabled && list.isNotEmpty) {
      play(list.last);
    }
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

final recentlyPlayedProvider = FutureProvider<List<RecentlyPlayedEntity>>((
  ref,
) async {
  final res = await ref.read(getRecentlyPlayedUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});
