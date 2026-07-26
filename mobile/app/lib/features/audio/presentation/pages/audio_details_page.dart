import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/audio_providers.dart';
import '../widgets/audio_state_widgets.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';
import '../../../../shared/theme/app_typography.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';

class AudioDetailsPage extends ConsumerWidget {
  final String audioId;

  const AudioDetailsPage({super.key, required this.audioId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final audioAsync = ref.watch(audioDetailsProvider(audioId));
    final playbackState = ref.watch(playbackStateProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: SSPAppBar(
        title: '', // Transparent AppBar
        leading: IconButton(
          icon: const Icon(Icons.keyboard_arrow_down_rounded, size: 32),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.share_rounded), onPressed: () {}),
          IconButton(
            icon: const Icon(Icons.favorite_border_rounded),
            onPressed: () {},
          ),
          AppSpacing.gapW8,
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

          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.deepSaffron.withValues(alpha: 0.15),
                  Theme.of(context).scaffoldBackgroundColor,
                ],
              ),
            ),
            child: SafeArea(
              child: Padding(
                padding: AppSpacing.p24,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    AppSpacing.gapH24,
                    // Large Artwork
                    Hero(
                      tag: 'audio_art_${audio.id}',
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: AppRadius.brXl,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.deepSaffron.withValues(
                                alpha: 0.2,
                              ),
                              blurRadius: 30,
                              offset: const Offset(0, 15),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: AppRadius.brXl,
                          child: Image.network(
                            audio.artworkUrl,
                            width: MediaQuery.of(context).size.width * 0.8,
                            height: MediaQuery.of(context).size.width * 0.8,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: MediaQuery.of(context).size.width * 0.8,
                              height: MediaQuery.of(context).size.width * 0.8,
                              color: Theme.of(
                                context,
                              ).colorScheme.surfaceContainerHighest,
                              child: Icon(
                                Icons.music_note_rounded,
                                size: 80,
                                color: AppColors.deepSaffron.withValues(
                                  alpha: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const Spacer(),
                    // Title & Speaker
                    Text(
                      audio.title,
                      style: AppTypography.headline.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary(context),
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    AppSpacing.gapH8,
                    Text(
                      audio.speaker,
                      style: AppTypography.subtitle.copyWith(
                        color: AppColors.textSecondary(context),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    AppSpacing.gapH24,

                    // Progress Bar
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        activeTrackColor: AppColors.deepSaffron,
                        inactiveTrackColor: AppColors.deepSaffron.withValues(
                          alpha: 0.2,
                        ),
                        thumbColor: AppColors.deepSaffron,
                        trackHeight: 6.0,
                        thumbShape: const RoundSliderThumbShape(
                          enabledThumbRadius: 8.0,
                        ),
                        overlayShape: const RoundSliderOverlayShape(
                          overlayRadius: 16.0,
                        ),
                      ),
                      child: Slider(
                        value: 0.3, // Mock progress
                        onChanged: (val) {},
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sp16,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '01:30',
                            style: AppTypography.button.copyWith(
                              color: AppColors.textSecondary(context),
                            ),
                          ),
                          Text(
                            _formatDuration(audio.duration),
                            style: AppTypography.button.copyWith(
                              color: AppColors.textSecondary(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                    AppSpacing.gapH24,

                    // Playback Controls
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.shuffle_rounded),
                          color: playbackState.isShuffleEnabled
                              ? AppColors.deepSaffron
                              : AppColors.textSecondary(context),
                          onPressed: () => ref
                              .read(playbackStateProvider.notifier)
                              .toggleShuffle(),
                        ),
                        IconButton(
                          icon: const Icon(Icons.skip_previous_rounded),
                          iconSize: 48,
                          color: AppColors.textPrimary(context),
                          onPressed: () {},
                        ),
                        GestureDetector(
                          onTap: () {
                            if (isPlaying) {
                              ref.read(playbackStateProvider.notifier).pause();
                            } else {
                              ref
                                  .read(playbackStateProvider.notifier)
                                  .play(audio);
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.all(20),
                            decoration: const BoxDecoration(
                              color: AppColors.deepSaffron,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.deepSaffron,
                                  blurRadius: 20,
                                  offset: Offset(0, 5),
                                ),
                              ],
                            ),
                            child: Icon(
                              isPlaying
                                  ? Icons.pause_rounded
                                  : Icons.play_arrow_rounded,
                              size: 48,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.skip_next_rounded),
                          iconSize: 48,
                          color: AppColors.textPrimary(context),
                          onPressed: () {},
                        ),
                        IconButton(
                          icon: const Icon(Icons.repeat_rounded),
                          color: playbackState.isRepeatEnabled
                              ? AppColors.deepSaffron
                              : AppColors.textSecondary(context),
                          onPressed: () => ref
                              .read(playbackStateProvider.notifier)
                              .toggleRepeat(),
                        ),
                      ],
                    ),
                    AppSpacing.gapH24,
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    return duration.inHours > 0
        ? "${twoDigits(duration.inHours)}:$twoDigitMinutes:$twoDigitSeconds"
        : "$twoDigitMinutes:$twoDigitSeconds";
  }
}
