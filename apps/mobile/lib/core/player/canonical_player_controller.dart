import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/audio/domain/entities/audio_entity.dart';
import '../../features/audio/presentation/providers/audio_providers.dart';
import '../navigation/navigation_logger.dart';
import '../navigation/route_hierarchy.dart';
import 'player_surface.dart';

/// The one route that presents the Full Player.
String canonicalPlayerRoute(String audioId) => '/audio/details/$audioId';

/// Extracts the audio id from a player deep link such as
/// `/audio/details/bhajan-42`, or `null` when [path] is not a player route.
///
/// Used by list surfaces (search results, notification payloads) that only
/// carry a route and not a resolved [AudioEntity].
String? audioIdFromPlayerRoute(String? path) {
  if (path == null) return null;
  final normalized = normalizeSspPath(path);
  const prefix = '/audio/details/';
  if (!normalized.startsWith(prefix)) return null;
  final id = normalized.substring(prefix.length);
  return id.isEmpty ? null : id;
}

/// A request to open the Full Player for one song.
class PlayerOpenRequest {
  const PlayerOpenRequest({
    required this.audioId,
    this.audio,
    this.queue = const [],
    this.index = 0,
    this.autoplay = true,
    this.source = 'unknown',
  });

  /// Opens the player for a fully resolved track with its surrounding queue.
  factory PlayerOpenRequest.track(
    AudioEntity audio, {
    List<AudioEntity> queue = const [],
    int index = 0,
    String source = 'unknown',
  }) => PlayerOpenRequest(
    audioId: audio.id,
    audio: audio,
    queue: queue,
    index: index,
    source: source,
  );

  /// Opens the player for a track that is only known by id. The player screen
  /// resolves and starts it.
  factory PlayerOpenRequest.id(
    String audioId, {
    String source = 'deep-link',
    bool autoplay = true,
  }) => PlayerOpenRequest(audioId: audioId, autoplay: autoplay, source: source);

  /// The track to make active in the single audio session.
  final String audioId;

  /// The resolved track, when the calling list already has it.
  final AudioEntity? audio;

  /// The queue the user was browsing, so Previous/Next stay meaningful.
  final List<AudioEntity> queue;

  /// Index of [audio] inside [queue].
  final int index;

  /// Whether playback should start.
  final bool autoplay;

  /// Where the request came from. Only used for logs and analytics.
  final String source;

  PlayerOpenRequest copyWith({
    String? audioId,
    AudioEntity? audio,
    List<AudioEntity>? queue,
    int? index,
    bool? autoplay,
    String? source,
  }) => PlayerOpenRequest(
    audioId: audioId ?? this.audioId,
    audio: audio ?? this.audio,
    queue: queue ?? this.queue,
    index: index ?? this.index,
    autoplay: autoplay ?? this.autoplay,
    source: source ?? this.source,
  );
}

/// THE canonical player-opening method for the entire application
/// (PHASE 3 / PHASE 7 / PHASE 8 / PHASE 9).
///
/// Every song list — audio home, bhajan list, search results, category results,
/// favorites, listening history, home sections, playlist tracks, stuti-vinati —
/// funnels through [open]. There is deliberately no second way in: tapping a
/// song always lands on the Full Player, never on the Mini Player alone.
///
/// The method guarantees, in this order:
///
/// 1. **No duplicate player.** A press that lands while a player route already
///    occupies the surface transitions the one session in place instead of
///    stacking a second player page.
/// 2. **One audio session.** The track becomes the active track of the single
///    playback engine, with the caller's queue attached, *before* navigation so
///    the player screen already shows the right song when its first frame is
///    drawn.
/// 3. **No restart.** Tapping the song that is already active re-opens the
///    player at its existing position and playback state (PHASE 6 / PHASE 8).
/// 4. **Origin-aware Back.** The player is pushed, never replaced, so Back
///    returns to the list the user came from (PHASE 7).
class CanonicalPlayerController {
  const CanonicalPlayerController(this.ref);

  final Ref ref;

  /// The canonical open. Returns `true` when the player was opened or the
  /// active track was transitioned.
  bool open(BuildContext context, PlayerOpenRequest request) {
    final audioId = request.audioId.trim();
    if (audioId.isEmpty) {
      NavLog.rejected(
        target: '/audio/details/<empty>',
        reason: 'missing-audio-id',
      );
      return false;
    }

    final notifier = ref.read(playbackStateProvider.notifier);
    final currentPath = GoRouter.of(context).state.uri.path;

    // 1. No duplicate player. A press that lands while a player route already
    //    occupies the surface transitions the one session in place instead of
    //    stacking a second player page (PHASE 8 / PHASE 9).
    if (isSspPlayerPath(currentPath)) {
      return _swapActiveTrackInPlace(context, request, notifier);
    }

    final alreadyActive = notifier.currentAudio?.id == audioId;

    // 2. Establish the single audio session synchronously so the player screen
    //    is correct on its very first frame. Never re-seeks an active track.
    if (!alreadyActive) {
      notifier.selectTrack(
        request.audio,
        audioId: audioId,
        queue: request.queue,
        index: request.index,
      );
    }

    // The full player takes over the player surface *before* the push, so the
    // Mini Player can never flash on the list screen for a single frame.
    ref.read(playerSurfaceProvider.notifier).open();

    // 3. Push so Back resolves to the logical source page (PHASE 7).
    context.push(canonicalPlayerRoute(audioId));

    if (!alreadyActive && request.autoplay && request.audio != null) {
      // Deliberately not awaited: navigation must not wait on media URL
      // resolution and buffering.
      unawaited(notifier.play(request.audio!));
    }

    NavLog.route(
      from: currentPath,
      to: canonicalPlayerRoute(audioId),
      reason:
          'canonical-player-open:${request.source}'
          '${alreadyActive ? ':resumed' : ''}',
    );
    return true;
  }

  /// Transitions the single audio session to [request] while the player is
  /// already on screen. No navigation, no second engine, no second player.
  bool _swapActiveTrackInPlace(
    BuildContext context,
    PlayerOpenRequest request,
    PlaybackNotifier notifier,
  ) {
    if (notifier.currentAudio?.id == request.audioId) {
      NavLog.rejected(
        target: canonicalPlayerRoute(request.audioId),
        reason: 'already-the-active-track',
      );
      return false;
    }

    notifier.selectTrack(
      request.audio,
      audioId: request.audioId,
      queue: request.queue,
      index: request.index,
    );
    ref.read(playerSurfaceProvider.notifier).open();

    if (request.autoplay && request.audio != null) {
      unawaited(notifier.play(request.audio!));
    }

    NavLog.route(
      from: GoRouter.of(context).state.uri.path,
      to: canonicalPlayerRoute(request.audioId),
      reason: 'canonical-player-swap:${request.source}',
    );
    return true;
  }

  /// Opens the Full Player for the track that is already loaded, without
  /// restarting it. This is the Mini Player's tap behaviour (PHASE 6).
  bool openCurrent(BuildContext context) {
    final current = ref.read(playbackStateProvider.notifier).currentAudio;
    if (current == null) {
      NavLog.rejected(
        target: '/audio/details/<none>',
        reason: 'no-active-track',
      );
      return false;
    }
    return open(
      context,
      PlayerOpenRequest.track(current, source: 'mini-player'),
    );
  }
}

final canonicalPlayerControllerProvider = Provider<CanonicalPlayerController>(
  CanonicalPlayerController.new,
);

/// Ergonomic access to the one canonical player-opening method.
///
/// Song lists call `ref.openPlayer(...)` / `ref.openAudio(...)` and get the
/// same behaviour everywhere, which is the whole point of the contract.
extension CanonicalPlayerRef on WidgetRef {
  CanonicalPlayerController get _player =>
      read(canonicalPlayerControllerProvider);

  /// The single canonical way to open the Full Player for [request].
  bool openPlayer(BuildContext context, PlayerOpenRequest request) =>
      _player.open(context, request);

  /// The single canonical way to open the Full Player for a resolved track.
  ///
  /// [queue] should be the list the user was looking at so Previous/Next walk
  /// the list they are browsing.
  bool openAudio(
    BuildContext context,
    AudioEntity audio, {
    List<AudioEntity> queue = const [],
    int index = 0,
    String source = 'song-list',
  }) => _player.open(
    context,
    PlayerOpenRequest.track(audio, queue: queue, index: index, source: source),
  );

  /// The single canonical way to open the Full Player for a track that is
  /// already loaded and playing. Never restarts it.
  bool openCurrentPlayer(BuildContext context) => _player.openCurrent(context);
}
