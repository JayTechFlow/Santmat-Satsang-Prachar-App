import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_hero_banner.dart';
import '../../../../shared/design_system/components/ssp_section_header.dart';
import '../../../../shared/design_system/components/ssp_audio_tile.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';

import '../../../../l10n/gen/app_localizations.dart';
import '../providers/audio_providers.dart';
import '../widgets/audio_category_section.dart';
import '../widgets/recently_played_section.dart';

class AudioHomePage extends ConsumerWidget {
  const AudioHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(audioHomeStateProvider);
    final l10n = AppLocalizations.of(context)!;

    if (state.isLoading &&
        state.featuredAudio.isEmpty &&
        state.popularAudio.isEmpty) {
      return Scaffold(
        appBar: SSPAppBar(title: l10n.audio),
        body: const SSPLoadingState(),
      );
    }

    if (state.error != null &&
        state.featuredAudio.isEmpty &&
        state.popularAudio.isEmpty) {
      return Scaffold(
        appBar: SSPAppBar(title: l10n.audio),
        body: SSPErrorState(
          message: state.error!,
          onRetry: () =>
              ref.read(audioHomeStateProvider.notifier).loadHomeData(),
        ),
      );
    }

    return Scaffold(
      appBar: SSPAppBar(
        title: l10n.audio,
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded),
            onPressed: () => context.push('/search'),
          ),
        ],
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: () =>
                ref.read(audioHomeStateProvider.notifier).loadHomeData(),
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      AppSpacing.gapH16,
                      if (state.featuredAudio.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sp16,
                          ),
                          child: SSPHeroBanner(
                            title: state.featuredAudio.first.title,
                            subtitle: state.featuredAudio.first.speaker,
                            badgeText: l10n.featuredAudio,
                            imageUrl: state.featuredAudio.first.thumbnailUrl,
                            onPlay: () => context.push(
                              '/audio/details/${state.featuredAudio.first.id}',
                            ),
                          ),
                        ),
                      AppSpacing.gapH24,
                      if (state.recentlyPlayed.isNotEmpty)
                        RecentlyPlayedSection(
                          title: l10n.recentlyPlayed,
                          recentlyPlayed: state.recentlyPlayed,
                          onTap: (rp) =>
                              context.push('/audio/details/${rp.audio.id}'),
                        ),
                      if (state.categories.isNotEmpty)
                        AudioCategorySection(
                          title: l10n.categories,
                          categories: state.categories,
                          onCategoryTap: (cat) =>
                              context.push('/audio/category/${cat.id}'),
                        ),
                      if (state.latestAudio.isNotEmpty) ...[
                        AppSpacing.gapH24,
                        SSPSectionHeader(
                          title: l10n.latestAudios,
                          actionText: l10n.seeAll,
                          onAction: () => context.push('/audio/latest'),
                        ),
                      ],
                    ],
                  ),
                ),
                if (state.latestAudio.isEmpty &&
                    state.featuredAudio.isEmpty &&
                    state.popularAudio.isEmpty)
                  SliverToBoxAdapter(
                    child: SSPEmptyState(
                      title: l10n.emptyStateTitle,
                      message: l10n.emptyStateMessage,
                    ),
                  )
                else if (state.latestAudio.isNotEmpty)
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final item = state.latestAudio[index];
                      return SSPAudioTile(
                        title: item.title,
                        subtitle: item.speaker,
                        durationText:
                            '${item.duration.inMinutes}:${(item.duration.inSeconds % 60).toString().padLeft(2, '0')}',
                        artwork: item.thumbnailUrl.isNotEmpty
                            ? SSPImage(
                                item.thumbnailUrl,
                                width: 56,
                                height: 56,
                                fit: BoxFit.cover,
                              )
                            : null,
                        onTap: () => context.push('/audio/details/${item.id}'),
                        onPlayPause: () {},
                      );
                    }, childCount: state.latestAudio.length),
                  ),
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      AppSpacing.gapH24,
                      if (state.popularAudio.isNotEmpty)
                        SSPSectionHeader(
                          title: l10n.popularAudio,
                          actionText: l10n.seeAll,
                          onAction: () => context.push('/audio/popular'),
                        ),
                    ],
                  ),
                ),
                if (state.popularAudio.isNotEmpty)
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final item = state.popularAudio[index];
                      return SSPAudioTile(
                        title: item.title,
                        subtitle: item.speaker,
                        durationText:
                            '${item.duration.inMinutes}:${(item.duration.inSeconds % 60).toString().padLeft(2, '0')}',
                        artwork: item.thumbnailUrl.isNotEmpty
                            ? SSPImage(
                                item.thumbnailUrl,
                                width: 56,
                                height: 56,
                                fit: BoxFit.cover,
                              )
                            : null,
                        onTap: () => context.push('/audio/details/${item.id}'),
                        onPlayPause: () {},
                      );
                    }, childCount: state.popularAudio.length),
                  ),
                const SliverToBoxAdapter(
                  child: SizedBox(height: 120),
                ), // Space for Mini Player
              ],
            ),
          ),
        ],
      ),
    );
  }
}
