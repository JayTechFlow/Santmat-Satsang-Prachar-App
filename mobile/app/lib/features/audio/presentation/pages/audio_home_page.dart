import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/audio_providers.dart';
import '../widgets/audio_state_widgets.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_audio_tile.dart';
import '../../../../shared/widgets/ssp_section_header.dart';
import '../../../../shared/widgets/ssp_mini_player.dart';

class AudioHomePage extends ConsumerWidget {
  const AudioHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(audioHomeStateProvider);

    return Scaffold(
      appBar: SSPAppBar(
        title: 'ऑडियो',
        subtitle: '|| सभी भजन सुनें ||',
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded),
            onPressed: () => context.push('/search'),
          ),
          AppSpacing.horizontalSpaceSm,
        ],
      ),
      body: state.isLoading
          ? const AudioLoadingWidget()
          : state.error != null
          ? AudioErrorWidget(
              message: state.error!,
              onRetry: () =>
                  ref.read(audioHomeStateProvider.notifier).loadHomeData(),
            )
          : RefreshIndicator(
              color: AppColors.deepSaffron,
              onRefresh: () =>
                  ref.read(audioHomeStateProvider.notifier).loadHomeData(),
              child: Stack(
                children: [
                  CustomScrollView(
                    slivers: [
                      if (state.featuredAudio.isNotEmpty)
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.lg,
                            vertical: AppSpacing.md,
                          ),
                          sliver: SliverToBoxAdapter(
                            child: SSPSectionHeader(
                              title: 'विशेष भजन',
                              icon: Icons.star_rounded,
                            ),
                          ),
                        ),
                      if (state.featuredAudio.isNotEmpty)
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.lg,
                          ),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate((
                              context,
                              index,
                            ) {
                              final audio = state.featuredAudio[index];
                              return Padding(
                                padding: const EdgeInsets.only(
                                  bottom: AppSpacing.md,
                                ),
                                child: SSPAudioTile(
                                  title: audio.title,
                                  subtitle: audio.speaker,
                                  imageUrl: audio.audioUrl,
                                  duration: _formatDuration(audio.duration),
                                  onTap: () => context.push(
                                    '/audio/details/${audio.id}',
                                  ),
                                  onPlayTap: () {},
                                  onMoreTap: () {},
                                ),
                              );
                            }, childCount: state.featuredAudio.length),
                          ),
                        ),

                      SliverPadding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                          vertical: AppSpacing.md,
                        ),
                        sliver: SliverToBoxAdapter(
                          child: SSPSectionHeader(
                            title: 'लोकप्रिय ऑडियो',
                            icon: Icons.trending_up_rounded,
                          ),
                        ),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                        ),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate((
                            context,
                            index,
                          ) {
                            final audio = state.popularAudio[index];
                            return Padding(
                              padding: const EdgeInsets.only(
                                bottom: AppSpacing.md,
                              ),
                              child: SSPAudioTile(
                                title: audio.title,
                                subtitle: audio.speaker,
                                imageUrl: audio.audioUrl,
                                duration: _formatDuration(audio.duration),
                                onTap: () =>
                                    context.push('/audio/details/${audio.id}'),
                                onPlayTap: () {},
                                onMoreTap: () {},
                              ),
                            );
                          }, childCount: state.popularAudio.length),
                        ),
                      ),
                      const SliverPadding(
                        padding: EdgeInsets.only(bottom: 120),
                      ),
                    ],
                  ),

                  // Global Mini Player at the bottom
                  Positioned(
                    bottom: AppSpacing.md,
                    left: AppSpacing.lg,
                    right: AppSpacing.lg,
                    child: SSPMiniPlayer(
                      title: 'प्रभु से प्रीत लगाई रे',
                      subtitle: 'पूज्य श्री',
                      imageUrl: 'https://picsum.photos/200',
                      durationText: '10:15',
                      themeColor: AppColors.deepSaffron,
                      onPlay: () {},
                    ),
                  ),
                ],
              ),
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
