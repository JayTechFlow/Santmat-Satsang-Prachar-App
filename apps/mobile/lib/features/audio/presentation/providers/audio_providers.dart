import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/media/presentation/providers/media_providers.dart';
import 'package:santmat_satsang_prachar/core/player/player_lifecycle.dart';
import 'package:santmat_satsang_prachar/core/player/player_seek_policy.dart';
import 'package:santmat_satsang_prachar/core/player/player_surface.dart';
import '../../domain/usecases/audio_usecases.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/mappers/stuti_audio_mapper.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../../../features/stuti_vinati/domain/entities/stuti_vinati_entity.dart';
import 'audio_state.dart';

/// Maps the engine's transport status onto the canonical lifecycle vocabulary
/// (PHASE 2). The two enums intentionally differ: the lifecycle has an explicit
/// "no track" state and collapses loading/buffering into one value.
PlayerPlaybackStatus playbackStatusOf(PlaybackStateEntity state) {
  if (state.currentAudio == null) return PlayerPlaybackStatus.noAudio;
  return switch (state.status) {
    PlaybackStatus.idle => PlayerPlaybackStatus.buffering,
    PlaybackStatus.loading => PlayerPlaybackStatus.buffering,
    PlaybackStatus.playing => PlayerPlaybackStatus.playing,
    PlaybackStatus.paused => PlayerPlaybackStatus.paused,
    PlaybackStatus.completed => PlayerPlaybackStatus.completed,
    PlaybackStatus.error => PlayerPlaybackStatus.error,
  };
}

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

      final featList = (featured.isSuccess)
          ? (featured.data as List<AudioEntity>)
          : <AudioEntity>[];
      final latestList = (latest.isSuccess)
          ? (latest.data as List<AudioEntity>)
          : <AudioEntity>[];
      final popList = (popular.isSuccess)
          ? (popular.data as List<AudioEntity>)
          : <AudioEntity>[];
      final catList = (categories.isSuccess)
          ? (categories.data as List<AudioCategoryEntity>)
          : <AudioCategoryEntity>[];
      final recList = (recentlyPlayed.isSuccess)
          ? (recentlyPlayed.data as List<RecentlyPlayedEntity>)
          : <RecentlyPlayedEntity>[];

      state = state.copyWith(
        isLoading: false,
        featuredAudio: featList,
        latestAudio: latestList,
        popularAudio: popList,
        categories: catList,
        recentlyPlayed: recList,
      );
    } catch (e) {
      if (!_mounted) return;
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
        featuredAudio: const [],
        latestAudio: const [],
        popularAudio: const [],
        categories: const [],
        recentlyPlayed: const [],
      );
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
  if (res.isSuccess && res.data != null) {
    return res.data!;
  }
  throw Exception('Audio not found: $id');
});

/// The one and only audio session of the application (PHASE 9).
///
/// Both the Full Player and the Mini Player read this one state. There is no
/// second engine, no duplicate player instance and no per-surface state.
class PlaybackNotifier extends Notifier<PlaybackStateEntity> {
  AudioPlayer? _player;
  bool _isActive = true;
  int _requestId = 0;
  List<AudioEntity> _queue = [];
  int _currentIndex = -1;
  bool _isScrubbing = false;

  List<AudioEntity> get queue => List.unmodifiable(_queue);
  int get currentIndex => _currentIndex;

  /// The active track of the single audio session, or `null` when nothing is
  /// loaded.
  AudioEntity? get currentAudio => state.currentAudio;

  /// Whether a previous track exists in the queue.
  bool get hasPrevious {
    if (_queue.isEmpty || state.currentAudio == null) return false;
    return _currentIndex > 0;
  }

  /// Whether a next track exists in the queue.
  bool get hasNext {
    if (_queue.isEmpty || state.currentAudio == null) return false;
    return _currentIndex >= 0 && _currentIndex < _queue.length - 1;
  }

  /// The canonical lifecycle snapshot for this session (PHASE 2).
  PlayerLifecycle get lifecycle => PlayerLifecycle.from(
    playback: playbackStatusOf(state),
    surface: ref.read(playerSurfaceProvider),
    hasTrack: state.currentAudio != null,
  );

  @override
  PlaybackStateEntity build() {
    _player = ref.watch(audioPlayerProvider);
    _isActive = true;

    if (_player != null) {
      final posSub = _player!.positionStream.listen((pos) {
        // While the user is dragging the progress bar the scrub position wins;
        // the engine position would otherwise fight the gesture.
        if (_isScrubbing) return;
        state = state.copyWith(position: pos);
      });

      final bufSub = _player!.bufferedPositionStream.listen((buf) {
        state = state.copyWith(buffered: buf);
      });

      final stateSub = _player!.playerStateStream.listen((playerState) {
        if (playerState.processingState == ProcessingState.completed) {
          state = state.copyWith(
            status: PlaybackStatus.completed,
            position: Duration.zero,
          );
          if (state.currentAudio != null) {
            ref
                .read(playbackAnalyticsServiceProvider)
                .logMediaComplete(
                  id: state.currentAudio!.id,
                  duration: _player?.duration ?? Duration.zero,
                );
          }
          _handleTrackCompleted();
        } else if (playerState.processingState == ProcessingState.loading ||
            playerState.processingState == ProcessingState.buffering) {
          if (state.currentAudio != null &&
              state.status != PlaybackStatus.error) {
            state = state.copyWith(status: PlaybackStatus.loading);
          }
        } else if (playerState.playing) {
          state = state.copyWith(status: PlaybackStatus.playing);
        } else if (playerState.processingState == ProcessingState.ready) {
          if (!playerState.playing && state.status == PlaybackStatus.playing) {
            state = state.copyWith(status: PlaybackStatus.paused);
          }
        } else if (playerState.processingState == ProcessingState.idle) {
          if (state.currentAudio != null &&
              state.status != PlaybackStatus.completed) {
            state = state.copyWith(status: PlaybackStatus.idle);
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

  /// Advances the queue automatically when a track finishes.
  void _handleTrackCompleted() {
    if (state.isRepeatEnabled) {
      playFromIndex(_currentIndex);
      return;
    }
    if (hasNext) {
      playFromIndex(_currentIndex + 1);
    }
    // No next track and no repeat: stay in COMPLETED so the surfaces can show
    // "played to the end" and Previous becomes available again.
  }

  /// Establishes which track the single audio session will play, and the queue
  /// it belongs to, *without* touching the engine.
  ///
  /// This is what the canonical player controller calls before navigating, so
  /// the Full Player is already correct on its first frame. The engine is
  /// started separately by [play].
  void selectTrack(
    AudioEntity? audio, {
    String? audioId,
    List<AudioEntity> queue = const [],
    int index = 0,
  }) {
    if (queue.isNotEmpty) {
      _queue = List.from(queue);
      if (audio != null) {
        final found = _queue.indexWhere((e) => e.id == audio.id);
        _currentIndex = found >= 0
            ? found
            : (index.clamp(0, _queue.length - 1));
      } else {
        _currentIndex = index.clamp(0, _queue.length - 1);
      }
    } else if (audio != null) {
      final found = _queue.indexWhere((e) => e.id == audio.id);
      if (found >= 0) {
        _currentIndex = found;
      } else {
        _queue = [audio];
        _currentIndex = 0;
      }
    }

    if (audio == null && audioId == null) return;

    state = state.copyWith(
      currentAudio: audio,
      status: PlaybackStatus.loading,
      position: Duration.zero,
      errorMessage: null,
    );
  }

  Future<void> setQueue(
    List<AudioEntity> playlist, {
    int initialIndex = 0,
  }) async {
    _queue = List.from(playlist);
    if (_queue.isEmpty) return;
    _currentIndex = (initialIndex >= 0 && initialIndex < _queue.length)
        ? initialIndex
        : 0;
    await play(_queue[_currentIndex]);
  }

  Future<void> replaceQueue(
    List<AudioEntity> playlist, {
    int initialIndex = 0,
  }) async {
    await stop();
    await setQueue(playlist, initialIndex: initialIndex);
  }

  Future<void> playFromIndex(int index) async {
    if (index < 0 || index >= _queue.length) return;
    _currentIndex = index;
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
        if (resolvedUrlStr.isEmpty) {
          state = state.copyWith(
            status: PlaybackStatus.error,
            errorMessage: 'Media URL is empty or unavailable.',
          );
          return;
        }
        audioUri = Uri.parse(resolvedUrlStr);
      }

      Uri? artUri;
      if (audio.thumbnailUrl.isNotEmpty) {
        final resolvedArtUrl = await urlResolver.resolveThumbnailUrl(
          audio.thumbnailUrl,
        );
        if (resolvedArtUrl.startsWith('http://') ||
            resolvedArtUrl.startsWith('https://')) {
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

      if (!_isActive || currentReqId != _requestId) return;

      await _player!.setAudioSource(AudioSource.uri(audioUri, tag: mediaItem));

      if (!_isActive || currentReqId != _requestId) return;

      state = state.copyWith(status: PlaybackStatus.playing);
      _player!.play();

      ref
          .read(playbackAnalyticsServiceProvider)
          .logMediaPlay(
            id: audio.id,
            title: audio.title,
            mediaType: 'audio',
            category: audio.category.name,
            durationSeconds: audio.duration.inSeconds,
          );
    } catch (e) {
      if (!_isActive || currentReqId != _requestId) return;
      if (!forceRefreshUrl) {
        return play(audio, forceRefreshUrl: true);
      }

      state = state.copyWith(
        status: PlaybackStatus.error,
        errorMessage: 'Playback error: $e',
      );

      ref
          .read(playbackAnalyticsServiceProvider)
          .logMediaError(id: audio.id, error: e.toString());
    }
  }

  void pause() {
    if (state.currentAudio == null) return;
    state = state.copyWith(status: PlaybackStatus.paused);
    _player?.pause();
    if (state.currentAudio != null) {
      ref
          .read(playbackAnalyticsServiceProvider)
          .logMediaPause(id: state.currentAudio!.id, position: state.position);
    }
  }

  void resume() {
    if (state.currentAudio == null) return;
    state = state.copyWith(status: PlaybackStatus.playing);
    _player?.play();
    if (state.currentAudio != null) {
      ref
          .read(playbackAnalyticsServiceProvider)
          .logMediaPlay(
            id: state.currentAudio!.id,
            title: state.currentAudio!.title,
            mediaType: 'audio',
            category: state.currentAudio!.category.name,
            durationSeconds: state.currentAudio!.duration.inSeconds,
          );
    }
  }

  /// The single play/pause toggle used by every transport control.
  void togglePlayPause() {
    if (state.currentAudio == null) return;
    final isPlaying = state.status == PlaybackStatus.playing;
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }

  /// The one explicit "end the session" action, used by the Mini Player's
  /// close button. Clears the single session, so the Mini Player disappears
  /// (PHASE 5).
  Future<void> clear() => stop();

  Future<void> stop() async {
    _requestId++;
    final currentId = state.currentAudio?.id;
    await _player?.stop();
    _queue = [];
    _currentIndex = -1;
    ref.read(playerSurfaceProvider.notifier).collapse();
    if (currentId != null) {
      ref.read(playbackAnalyticsServiceProvider).logMediaStop(id: currentId);
    }
    state = const PlaybackStateEntity();
  }

  Future<void> retry() async {
    final current = state.currentAudio;
    if (current == null) return;
    await play(current, forceRefreshUrl: true);
  }

  Future<void> playStuti(StutiVinati stuti) async {
    final audio = stutiToAudioEntity(stuti);
    await play(audio, forceRefreshUrl: true);
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
    final total = state.currentAudio?.duration ?? Duration.zero;
    final target = position < Duration.zero
        ? Duration.zero
        : (total > Duration.zero && position > total ? total : position);
    state = state.copyWith(position: target);
    _player?.seek(target);
    if (state.currentAudio != null) {
      ref
          .read(playbackAnalyticsServiceProvider)
          .logMediaSeek(id: state.currentAudio!.id, targetPosition: target);
    }
  }

  /// LONG-PRESS SEEK — moves the transport by [delta] from the current
  /// position, clamped to the track bounds. Used by the hold-to-seek controls
  /// on both the Full Player and the Mini Player.
  void seekBy(Duration delta) {
    if (state.currentAudio == null) return;
    final target = resolveHoldSeekTarget(
      current: state.position,
      total: _effectiveDuration,
      direction: delta.isNegative
          ? SeekDirection.backward
          : SeekDirection.forward,
      step: delta.abs(),
      steps: 1,
    );
    seekTo(target);
  }

  /// The duration to clamp seeking against. Prefers the engine's real duration
  /// and falls back to the catalogue duration.
  Duration get _effectiveDuration {
    final engineDuration = _player?.duration;
    if (engineDuration != null && engineDuration > Duration.zero) {
      return engineDuration;
    }
    return state.currentAudio?.duration ?? Duration.zero;
  }

  void rewind5() => seekBy(const Duration(seconds: -5));

  void forward5() => seekBy(const Duration(seconds: 5));

  /// Enters scrub mode: the gesture owns the reported position until
  /// [endScrub] or [cancelScrub] is called.
  void beginScrub() {
    _isScrubbing = true;
  }

  /// Updates the scrub preview without seeking the engine.
  void updateScrub(Duration position) {
    if (!_isScrubbing) return;
    final total = _effectiveDuration;
    state = state.copyWith(
      position: position < Duration.zero
          ? Duration.zero
          : (total > Duration.zero && position > total ? total : position),
    );
  }

  /// Commits the scrub position to the engine.
  void endScrub() {
    if (!_isScrubbing) return;
    _isScrubbing = false;
    final committed = state.position;
    _player?.seek(committed);
  }

  /// Abandons the scrub, restoring the engine's real position.
  void cancelScrub() {
    if (!_isScrubbing) return;
    _isScrubbing = false;
    state = state.copyWith(position: _player?.position ?? state.position);
  }

  /// SMART NEXT.
  ///
  /// Resolved by the one shared policy so the Full Player and the Mini Player
  /// behave identically.
  Future<void> playNext([List<AudioEntity>? playlist]) async {
    final list = playlist ?? _queue;
    if (list.isEmpty || state.currentAudio == null) return;

    final index = list.indexWhere((a) => a.id == state.currentAudio!.id);
    if (index == -1) return;

    final action = resolveSmartNext(
      hasTrack: true,
      hasNextTrack: index < list.length - 1,
      isRepeatEnabled: state.isRepeatEnabled,
    );

    switch (action) {
      case SmartNextAction.selectNextTrack:
        if (_queue.isNotEmpty) {
          final target = _queue.indexWhere((a) => a.id == list[index + 1].id);
          if (target >= 0) {
            _currentIndex = target;
            await play(list[index + 1]);
            return;
          }
        }
        await play(list[index + 1]);
      case SmartNextAction.restartCurrentTrack:
        await play(list[index]);
      case SmartNextAction.stopAtQueueEnd:
        state = state.copyWith(
          status: PlaybackStatus.completed,
          position: _effectiveDuration,
        );
      case SmartNextAction.noAction:
        return;
    }
  }

  /// SMART PREVIOUS — restarts the current track when the user is already
  /// more than [kSmartPreviousRestartThreshold] into it, otherwise steps back
  /// in the queue.
  Future<void> playPrevious([List<AudioEntity>? playlist]) async {
    final list = playlist ?? _queue;
    if (list.isEmpty || state.currentAudio == null) return;

    final index = list.indexWhere((a) => a.id == state.currentAudio!.id);
    if (index == -1) return;

    final action = resolveSmartPrevious(
      hasTrack: true,
      position: state.position,
      hasPreviousTrack: index > 0,
      isRepeatEnabled: state.isRepeatEnabled,
    );

    switch (action) {
      case SmartPreviousAction.restartCurrentTrack:
        seekTo(Duration.zero);
        if (state.status == PlaybackStatus.paused) resume();
      case SmartPreviousAction.selectPreviousTrack:
        final previousIndex = index > 0 ? index - 1 : list.length - 1;
        final target = _queue.indexWhere((a) => a.id == list[previousIndex].id);
        if (target >= 0) _currentIndex = target;
        await play(list[previousIndex]);
      case SmartPreviousAction.noAction:
        return;
    }
  }
}

final playbackStateProvider =
    NotifierProvider<PlaybackNotifier, PlaybackStateEntity>(
      PlaybackNotifier.new,
    );

class UserFavoritesNotifier extends Notifier<Set<String>> {
  @override
  Set<String> build() {
    final favsAsync = ref.watch(favoritesProvider);
    return favsAsync.asData?.value.map((f) => f.audio.id).toSet() ??
        const <String>{};
  }

  Future<void> toggleFavorite(String id) async {
    final wasFav = state.contains(id);
    final next = Set<String>.from(state);
    if (wasFav) {
      next.remove(id);
    } else {
      next.add(id);
    }
    state = next;
    try {
      final res = await ref.read(toggleFavoriteAudioUseCaseProvider).call(id);
      if (res.isSuccess) {
        ref.invalidate(favoritesProvider);
      } else {
        state = wasFav
            ? (Set<String>.from(state)..add(id))
            : (Set<String>.from(state)..remove(id));
      }
    } catch (_) {
      state = wasFav
          ? (Set<String>.from(state)..add(id))
          : (Set<String>.from(state)..remove(id));
    }
  }
}

final userFavoritesProvider =
    NotifierProvider<UserFavoritesNotifier, Set<String>>(
      UserFavoritesNotifier.new,
    );

class LocalPlaylist {
  final String id;
  final String name;
  final List<String> bhajanIds;
  final String createdAt;

  const LocalPlaylist({
    required this.id,
    required this.name,
    required this.bhajanIds,
    required this.createdAt,
  });

  LocalPlaylist copyWith({
    String? id,
    String? name,
    List<String>? bhajanIds,
    String? createdAt,
  }) {
    return LocalPlaylist(
      id: id ?? this.id,
      name: name ?? this.name,
      bhajanIds: bhajanIds ?? this.bhajanIds,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

class UserPlaylistsNotifier extends Notifier<List<LocalPlaylist>> {
  @override
  List<LocalPlaylist> build() {
    return const [
      LocalPlaylist(
        id: 'pl-1',
        name: 'दैनिक सत्संग भजन',
        bhajanIds: ['bhajan-1', 'bhajan-2'],
        createdAt: 'आज',
      ),
      LocalPlaylist(
        id: 'pl-2',
        name: 'प्रभात स्मरण एवं वंदना',
        bhajanIds: ['bhajan-3'],
        createdAt: 'कल',
      ),
      LocalPlaylist(
        id: 'pl-3',
        name: 'गुरु महिमा भजन',
        bhajanIds: ['bhajan-4', 'bhajan-5'],
        createdAt: '3 दिन पहले',
      ),
    ];
  }

  String createPlaylist(String name, [String? initialBhajanId]) {
    final newId = 'pl-${DateTime.now().millisecondsSinceEpoch}';
    final newPl = LocalPlaylist(
      id: newId,
      name: name.trim().isEmpty ? 'मेरी प्लेलिस्ट' : name.trim(),
      bhajanIds: initialBhajanId != null ? [initialBhajanId] : [],
      createdAt: 'आज',
    );
    state = [newPl, ...state];
    return newId;
  }

  void toggleBhajanInPlaylist(String playlistId, String bhajanId) {
    state = state.map((pl) {
      if (pl.id == playlistId) {
        final exists = pl.bhajanIds.contains(bhajanId);
        final nextIds = exists
            ? pl.bhajanIds.where((id) => id != bhajanId).toList()
            : [...pl.bhajanIds, bhajanId];
        return pl.copyWith(bhajanIds: nextIds);
      }
      return pl;
    }).toList();
  }
}

final userPlaylistsProvider =
    NotifierProvider<UserPlaylistsNotifier, List<LocalPlaylist>>(
      UserPlaylistsNotifier.new,
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
