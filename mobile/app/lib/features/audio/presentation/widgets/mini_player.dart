import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/audio_providers.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../../../shared/design_system/components/ssp_mini_player.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';

class MiniPlayer extends ConsumerWidget {
  const MiniPlayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playbackState = ref.watch(playbackStateProvider);
    final audio = playbackState.currentAudio;

    if (audio == null) return const SizedBox.shrink();

    final isPlaying = playbackState.status == PlaybackStatus.playing;
    final progress = audio.duration.inMilliseconds > 0
        ? (playbackState.position.inMilliseconds /
                  audio.duration.inMilliseconds)
              .clamp(0.0, 1.0)
        : 0.0;

    return SSPMiniPlayer(
      title: audio.title,
      subtitle: audio.speaker,
      artwork: audio.thumbnailUrl.isNotEmpty
          ? SSPImage(
              audio.thumbnailUrl,
              width: 48,
              height: 48,
              fit: BoxFit.cover,
            )
          : null,
      isPlaying: isPlaying,
      progress: progress,
      onPlayPause: () {
        final notifier = ref.read(playbackStateProvider.notifier);
        if (isPlaying) {
          notifier.pause();
        } else {
          notifier.resume();
        }
      },
      onClose: () {
        ref.read(playbackStateProvider.notifier).stop();
      },
      onTap: () {
        context.push('/audio/details/${audio.id}');
      },
    );
  }
}
