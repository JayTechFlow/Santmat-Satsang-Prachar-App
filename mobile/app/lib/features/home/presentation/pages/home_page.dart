import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_hero_banner.dart';
import '../../../../shared/widgets/ssp_quick_action_card.dart';
import '../../../../shared/widgets/ssp_quote_card.dart';
import '../../../../shared/widgets/ssp_search_bar.dart';
import '../../../../shared/widgets/ssp_section_header.dart';
import '../../../../shared/widgets/ssp_audio_tile.dart';
import '../../../../shared/widgets/ssp_loading.dart';
import '../../../../shared/widgets/ssp_error_state.dart';
import '../../../../shared/widgets/ssp_empty_state.dart';
import '../providers/home_providers.dart';
import '../../../daily_quotes/presentation/providers/daily_quotes_providers.dart';
import '../../../audio/presentation/providers/audio_providers.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeStateProvider);
    final quoteState = ref.watch(dailyQuotesProvider);
    final audioState = ref.watch(audioHomeStateProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: SSPAppBar(
        title: 'Santmat',
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded),
            onPressed: () => context.push('/notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.settings_rounded),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: homeState.when(
        loading: () => const SSPLoadingWidget(),
        error: (err, stack) => SSPErrorState(
          message: err.toString(),
          onRetry: () => ref.read(homeStateProvider.notifier).refreshDashboard(),
        ),
        data: (data) => CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Column(
                children: [
                  AppSpacing.gapH64, // Padding for App Bar
                  AppSpacing.gapH24,
                  // Search Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16),
                    child: SSPSearchBar(
                      hintText: 'Search bhajans, satsangs, books...',
                      readOnly: true,
                      onTap: () => context.push('/search'),
                    ),
                  ),
                  AppSpacing.gapH24,
                  // Hero Banner
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16),
                    child: SSPHeroBanner(
                      title: 'Morning Satsang',
                      subtitle: 'Start your day with divine wisdom',
                      badgeText: "Today's Featured",
                      onPlay: () => context.push('/satsang'),
                    ),
                  ),
                  AppSpacing.gapH24,
                  // Quick Actions Grid
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16),
                    child: Row(
                      children: [
                        Expanded(
                          child: SSPActionCard(
                            title: 'Audio Library',
                            icon: Icons.library_music_rounded,
                            onTap: () => context.push('/audio'),
                            color: AppColors.deepSaffron,
                          ),
                        ),
                        AppSpacing.gapW16,
                        Expanded(
                          child: SSPActionCard(
                            title: 'Stuti & Vinati',
                            icon: Icons.menu_book_rounded,
                            onTap: () => context.push('/satsang'),
                            color: AppColors.sacredGold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  AppSpacing.gapH32,
                  // Daily Quote
                  if (quoteState.todayQuote != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16),
                      child: SSPQuoteCard(
                        quote: quoteState.todayQuote!.quoteText,
                        author: quoteState.todayQuote!.author.name,
                      ),
                    ),
                  AppSpacing.gapH32,
                ],
              ),
            ),
            // Latest Audio Section
            SliverToBoxAdapter(
              child: SSPSectionHeader(
                title: 'Latest Bhajans',
                actionText: 'View All',
                onActionTap: () => context.push('/audio'),
              ),
            ),
            if (audioState.isLoading)
              const SliverToBoxAdapter(child: SSPLoadingWidget())
            else if (audioState.latestAudio.isEmpty)
              SliverToBoxAdapter(
                child: SSPEmptyState(
                  title: 'No Audio Found',
                  message: 'Check back later for new uploads.',
                ),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final item = audioState.latestAudio[index];
                    return SSPAudioTile(
                      title: item.title,
                      subtitle: item.speaker,
                      duration: '0:00', // Mock duration if not in entity
                      imageUrl: item.thumbnailUrl,
                      onTap: () => context.push('/audio/details/${item.id}'),
                      onPlayPause: () {},
                    );
                  },
                  childCount: audioState.latestAudio.length > 5 ? 5 : audioState.latestAudio.length,
                ),
              ),
            const SliverToBoxAdapter(child: AppSpacing.gapH64),
          ],
        ),
      ),
    );
  }
}
