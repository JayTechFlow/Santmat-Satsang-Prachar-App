import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/home_providers.dart';
import '../widgets/daily_quote_card.dart';

import '../widgets/error_state_widget.dart';
import '../widgets/featured_banner_carousel.dart';
import '../widgets/featured_books_section.dart';
import '../widgets/home_app_bar.dart';
import '../widgets/latest_audio_section.dart';
import '../widgets/latest_satsang_section.dart';
import '../widgets/loading_state_widget.dart';
import '../widgets/quick_actions_grid.dart';
import '../widgets/upcoming_events_section.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeStateProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: homeState.maybeWhen(
        data: (data) => HomeAppBar(
          notificationCount: data.notificationCount,
          profileInitial: 'U', // Update when user profile feature is available
        ),
        orElse: () => const HomeAppBar(
          notificationCount: 0,
          profileInitial: '',
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(homeStateProvider.notifier).refreshDashboard(),
        child: homeState.when(
          loading: () => const LoadingStateWidget(),
          error: (err, stack) => ErrorStateWidget(
            message: err.toString(),
            onRetry: () => ref.read(homeStateProvider.notifier).refreshDashboard(),
          ),
          data: (data) {
            return CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (data.banners.isNotEmpty)
                        FeaturedBannerCarousel(banners: data.banners),
                      if (data.quickActions.isNotEmpty)
                        QuickActionsGrid(actions: data.quickActions),
                      if (data.dailyQuote != null)
                        DailyQuoteCard(quote: data.dailyQuote!),
                      if (data.latestAudios.isNotEmpty)
                        LatestAudioSection(audios: data.latestAudios),
                      if (data.latestSatsangs.isNotEmpty)
                        LatestSatsangSection(satsangs: data.latestSatsangs),
                      if (data.upcomingEvents.isNotEmpty)
                        UpcomingEventsSection(events: data.upcomingEvents),
                      if (data.featuredBooks.isNotEmpty)
                        FeaturedBooksSection(books: data.featuredBooks),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
