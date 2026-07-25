import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/audio_providers.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../../../shared/theme/app_spacing.dart';

class MiniPlayer extends ConsumerWidget {
  const MiniPlayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playbackState = ref.watch(playbackStateProvider);
    final audio = playbackState.currentAudio;

    if (audio == null) return const SizedBox.shrink();

    return Container(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: Row(
        children: [
          CircleAvatar(backgroundImage: NetworkImage(audio.thumbnailUrl)),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  audio.title,
                  style: Theme.of(context).textTheme.titleSmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  audio.speaker,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(
              playbackState.status == PlaybackStatus.playing
                  ? Icons.pause_circle_filled
                  : Icons.play_circle_filled,
            ),
            iconSize: 32,
            onPressed: () {
              final notifier = ref.read(playbackStateProvider.notifier);
              if (playbackState.status == PlaybackStatus.playing) {
                notifier.pause();
              } else {
                notifier.resume();
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              ref.read(playbackStateProvider.notifier).stop();
            },
          ),
        ],
      ),
    );
  }
}
