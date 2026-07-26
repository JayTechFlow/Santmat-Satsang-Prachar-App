import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_hero_banner.dart';
import '../../../../shared/widgets/ssp_section_header.dart';
import '../../../../shared/widgets/ssp_audio_tile.dart';
import '../../../../shared/widgets/ssp_loading.dart';
import '../../../../shared/widgets/ssp_error_state.dart';
import '../../../../shared/widgets/ssp_empty_state.dart';
import '../../../../shared/widgets/ssp_mini_player.dart';
import '../providers/audio_providers.dart';

class AudioHomePage extends ConsumerWidget {
  const AudioHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(audioHomeStateProvider);

    if (state.isLoading) {
      return Scaffold(
        appBar: SSPAppBar(title: 'Audio Library'),
        body: const SSPLoadingWidget(),
      );
    }

    if (state.error != null) {
      return Scaffold(
        appBar: SSPAppBar(title: 'Audio Library'),
        body: SSPErrorState(
          message: state.error!,
          onRetry: () => ref.read(audioHomeStateProvider.notifier).loadHomeData(),
        ),
      );
    }

    return Scaffold(
      appBar: SSPAppBar(
        title: 'Audio Library',
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded),
            onPressed: () => context.push('/search'),
          ),
        ],
      ),
      body: Stack(
        children: [
          CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Column(
                  children: [
                    AppSpacing.gapH16,
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16),
                      child: SSPHeroBanner(
                        title: 'Divine Collection',
                        subtitle: 'Immerse yourself in soul-stirring bhajans',
                        badgeText: 'Curated for you',
                        onPlay: () {},
                      ),
                    ),
                    AppSpacing.gapH32,
                    SSPSectionHeader(
                      title: 'Featured Audio',
                      icon: Icons.star_rounded,
                    ),
                  ],
                ),
              ),
              if (state.featuredAudio.isEmpty)
                SliverToBoxAdapter(
                  child: SSPEmptyState(
                    title: 'No Featured Audio',
                    message: 'Check back soon.',
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = state.featuredAudio[index];
                      return SSPAudioTile(
                        title: item.title,
                        subtitle: item.speaker,
                        duration: '0:00', // Mock
                        imageUrl: item.thumbnailUrl,
                        onTap: () => context.push('/audio/details/${item.id}'),
                        onPlayPause: () {},
                      );
                    },
                    childCount: state.featuredAudio.length,
                  ),
                ),
              SliverToBoxAdapter(
                child: Column(
                  children: [
                    AppSpacing.gapH24,
                    SSPSectionHeader(
                      title: 'Popular Tracks',
                      icon: Icons.trending_up_rounded,
                    ),
                  ],
                ),
              ),
              if (state.popularAudio.isEmpty)
                SliverToBoxAdapter(
                  child: SSPEmptyState(
                    title: 'No Popular Audio',
                    message: 'Keep listening to see top tracks.',
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = state.popularAudio[index];
                      return SSPAudioTile(
                        title: item.title,
                        subtitle: item.speaker,
                        duration: '0:00',
                        imageUrl: item.thumbnailUrl,
                        onTap: () => context.push('/audio/details/${item.id}'),
                        onPlayPause: () {},
                      );
                    },
                    childCount: state.popularAudio.length,
                  ),
                ),
              const SliverToBoxAdapter(child: SizedBox(height: 120)), // Space for Mini Player
            ],
          ),
          
          // Global Mini Player Placeholder (mocking active playback state)
          Align(
            alignment: Alignment.bottomCenter,
            child: SafeArea(
              child: SSPMiniPlayer(
                title: 'Prabhu Ka Naam',
                subtitle: 'Morning Satsang',
                isPlaying: false,
                onPlayPause: () {},
                onTap: () => context.push('/audio/details/1'), // mock ID
                progress: 0.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
