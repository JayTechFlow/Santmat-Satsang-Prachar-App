import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:santmat_satsang_prachar/core/navigation/route_hierarchy.dart';
import 'package:santmat_satsang_prachar/core/player/canonical_player_controller.dart';
import 'package:santmat_satsang_prachar/core/player/mini_player_visibility.dart';
import 'package:santmat_satsang_prachar/core/player/player_lifecycle.dart';
import 'package:santmat_satsang_prachar/core/player/player_surface.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_mini_player.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';

import '../providers/audio_providers.dart';
import '../../domain/entities/playback_state_entity.dart';

/// The one and only Mini Player of the app shell (PHASE 4 / PHASE 5 / PHASE 6).
///
/// It is a *surface*, not an engine: it renders the same playback state the
/// Full Player renders. Its visibility is decided by the one shared policy in
/// [resolveMiniPlayerVisibility], and its tap opens the Full Player through the
/// one canonical player-opening method without ever restarting the track.
class MiniPlayer extends ConsumerWidget {
  const MiniPlayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playbackState = ref.watch(playbackStateProvider);
    final surface = ref.watch(playerSurfaceProvider);
    final excluded = ref.watch(miniPlayerExcludedPathsProvider);
    final currentPath = GoRouter.of(context).state.uri.path;

    final lifecycle = PlayerLifecycle.from(
      playback: playbackStatusOf(playbackState),
      surface: surface,
      hasTrack: playbackState.currentAudio != null,
    );

    final visibility = resolveMiniPlayerVisibility(
      hasTrack: lifecycle.hasTrack,
      hasActiveSession: lifecycle.hasActiveSession,
      // Both signals must agree: a player route is authoritative even before
      // the surface provider has settled, so the Mini Player can never coexist
      // with a visible player.
      isPlayerVisible: lifecycle.isPlayerOpen || isSspPlayerPath(currentPath),
      screenSupportsMiniPlayer: screenSupportsMiniPlayer(currentPath, excluded),
    );

    if (!visibility.visible) return const SizedBox.shrink();

    final audio = playbackState.currentAudio!;
    final notifier = ref.read(playbackStateProvider.notifier);
    final isPlaying = playbackState.status == PlaybackStatus.playing;
    final duration = audio.duration;
    final progress = duration.inMilliseconds > 0
        ? (playbackState.position.inMilliseconds / duration.inMilliseconds)
              .clamp(0.0, 1.0)
        : 0.0;

    return SSPMiniPlayer(
      title: audio.title,
      subtitle: audio.speaker,
      artwork: audio.thumbnailUrl.isNotEmpty
          ? SSPImage(
              audio.thumbnailUrl,
              width: 42,
              height: 42,
              fit: BoxFit.cover,
            )
          : null,
      isPlaying: isPlaying,
      progress: progress,
      position: playbackState.position,
      duration: duration,
      onPlayPause: notifier.togglePlayPause,
      onSkipPrevious: notifier.playPrevious,
      onSkipNext: notifier.playNext,
      // LONG-PRESS SEEK straight from the Mini Player.
      onHoldSeek: (target) => notifier.seekTo(target),
      // Clearing the session is the only thing that removes the bar: there is
      // no separate "hide" that would leave a zombie audio session behind.
      onClose: notifier.clear,
      onTap: () => ref.openCurrentPlayer(context),
    );
  }
}
