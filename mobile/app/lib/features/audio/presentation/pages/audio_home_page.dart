import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/audio_providers.dart';
import '../widgets/audio_state_widgets.dart';
import '../widgets/featured_audio_card.dart';
import '../widgets/audio_category_section.dart';
import '../widgets/recently_played_section.dart';
import '../widgets/audio_card.dart';
import '../widgets/mini_player.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../l10n/gen/app_localizations.dart';

class AudioHomePage extends ConsumerWidget {
  const AudioHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(audioHomeStateProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.audio),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
          ),
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => context.push('/audio/history'),
          ),
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
              onRefresh: () =>
                  ref.read(audioHomeStateProvider.notifier).loadHomeData(),
              child: Stack(
                children: [
                  CustomScrollView(
                    slivers: [
                      if (state.featuredAudio.isNotEmpty)
                        SliverToBoxAdapter(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md,
                                  vertical: AppSpacing.sm,
                                ),
                                child: Text(
                                  l10n.featuredAudio,
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                              ),
                              SizedBox(
                                height: 220,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  itemCount: state.featuredAudio.length,
                                  itemBuilder: (context, index) {
                                    return FeaturedAudioCard(
                                      audio: state.featuredAudio[index],
                                      onTap: () => context.push(
                                        '/audio/details/${state.featuredAudio[index].id}',
                                      ),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(height: AppSpacing.md),
                            ],
                          ),
                        ),
                      SliverToBoxAdapter(
                        child: AudioCategorySection(
                          title: l10n.categories,
                          categories: state.categories,
                          onCategoryTap: (category) =>
                              context.push('/audio/category/${category.id}'),
                        ),
                      ),
                      SliverToBoxAdapter(
                        child: const SizedBox(height: AppSpacing.md),
                      ),
                      SliverToBoxAdapter(
                        child: RecentlyPlayedSection(
                          title: l10n.recentlyPlayed,
                          recentlyPlayed: state.recentlyPlayed,
                          onTap: (played) =>
                              context.push('/audio/details/${played.audio.id}'),
                        ),
                      ),
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.md,
                            vertical: AppSpacing.sm,
                          ),
                          child: Text(
                            l10n.popularAudio,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                        ),
                      ),
                      SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                            ),
                            child: AudioCard(
                              audio: state.popularAudio[index],
                              onTap: () => context.push(
                                '/audio/details/${state.popularAudio[index].id}',
                              ),
                            ),
                          );
                        }, childCount: state.popularAudio.length),
                      ),
                      const SliverPadding(
                        padding: EdgeInsets.only(bottom: 100),
                      ),
                    ],
                  ),
                  const Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: MiniPlayer(),
                  ),
                ],
              ),
            ),
    );
  }
}
