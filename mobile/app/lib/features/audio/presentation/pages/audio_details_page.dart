import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/audio_providers.dart';
import '../widgets/audio_state_widgets.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';
import '../../../../l10n/gen/app_localizations.dart';

class AudioDetailsPage extends ConsumerWidget {
  final String audioId;

  const AudioDetailsPage({super.key, required this.audioId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final audioAsync = ref.watch(audioDetailsProvider(audioId));
    final l10n = AppLocalizations.of(context)!;
    final playbackState = ref.watch(playbackStateProvider);

    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
          IconButton(icon: const Icon(Icons.favorite_border), onPressed: () {}),
        ],
      ),
      body: audioAsync.when(
        loading: () => const AudioLoadingWidget(),
        error: (err, stack) => AudioErrorWidget(
          message: err.toString(),
          onRetry: () => ref.refresh(audioDetailsProvider(audioId)),
        ),
        data: (audio) {
          final isPlaying =
              playbackState.currentAudio?.id == audio.id &&
              playbackState.status == PlaybackStatus.playing;

          return SingleChildScrollView(
            padding: AppSpacing.paddingAllLg,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Hero(
                  tag: 'audio_art_${audio.id}',
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    child: Image.network(
                      audio.artworkUrl,
                      width: 250,
                      height: 250,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 250,
                        height: 250,
                        color: Colors.grey.shade300,
                        child: const Icon(Icons.music_note, size: 80),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(
                  audio.title,
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  audio.speaker,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.lg),
                // Playback Controls
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.shuffle),
                      onPressed: () => ref
                          .read(playbackStateProvider.notifier)
                          .toggleShuffle(),
                      color: playbackState.isShuffleEnabled
                          ? Theme.of(context).colorScheme.primary
                          : null,
                    ),
                    IconButton(
                      icon: const Icon(Icons.skip_previous),
                      iconSize: 40,
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: Icon(
                        isPlaying
                            ? Icons.pause_circle_filled
                            : Icons.play_circle_filled,
                      ),
                      iconSize: 64,
                      color: Theme.of(context).colorScheme.primary,
                      onPressed: () {
                        if (isPlaying) {
                          ref.read(playbackStateProvider.notifier).pause();
                        } else {
                          ref.read(playbackStateProvider.notifier).play(audio);
                        }
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.skip_next),
                      iconSize: 40,
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: const Icon(Icons.repeat),
                      onPressed: () => ref
                          .read(playbackStateProvider.notifier)
                          .toggleRepeat(),
                      color: playbackState.isRepeatEnabled
                          ? Theme.of(context).colorScheme.primary
                          : null,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                // Progress Bar Placeholder
                LinearProgressIndicator(value: 0.3),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('01:30', style: Theme.of(context).textTheme.bodySmall),
                    Text(
                      '${audio.duration.inMinutes}:00',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                // Details
                Align(
                  alignment: Alignment.centerLeft,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.description,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(audio.description),
                      const SizedBox(height: AppSpacing.lg),
                      Row(
                        children: [
                          const Icon(Icons.category, size: 16),
                          const SizedBox(width: AppSpacing.xs),
                          Text(audio.category.name),
                          const SizedBox(width: AppSpacing.lg),
                          const Icon(Icons.language, size: 16),
                          const SizedBox(width: AppSpacing.xs),
                          Text(audio.language),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
