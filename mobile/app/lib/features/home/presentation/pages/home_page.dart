import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../authentication/presentation/providers/auth_state_provider.dart';
import '../providers/home_providers.dart';
import '../widgets/daily_quote_card.dart';

import '../widgets/error_state_widget.dart';
import '../widgets/featured_banner_carousel.dart';
import '../widgets/featured_books_section.dart';
import '../widgets/greeting_card.dart';
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
    final authState = ref.watch(authStateProvider);
    final user = authState.value?.user;

    final displayName = user?.displayName ?? 'Devotee';
    final profileInitial = displayName.isNotEmpty
        ? displayName[0].toUpperCase()
        : 'D';

    return homeState.when(
      data: (data) {
        return Scaffold(
          appBar: HomeAppBar(
            notificationCount: data.notificationCount,
            profileInitial: profileInitial,
          ),
          body: RefreshIndicator(
            onRefresh: () =>
                ref.read(homeStateProvider.notifier).refreshDashboard(),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: GreetingCard(name: displayName)),
                if (data.dailyQuote != null)
                  SliverToBoxAdapter(
                    child: DailyQuoteCard(quote: data.dailyQuote!),
                  ),
                SliverToBoxAdapter(
                  child: FeaturedBannerCarousel(banners: data.banners),
                ),
                SliverToBoxAdapter(
                  child: QuickActionsGrid(actions: data.quickActions),
                ),
                SliverToBoxAdapter(
                  child: LatestSatsangSection(satsangs: data.latestSatsangs),
                ),
                SliverToBoxAdapter(
                  child: UpcomingEventsSection(events: data.upcomingEvents),
                ),
                SliverToBoxAdapter(
                  child: LatestAudioSection(audios: data.latestAudios),
                ),
                SliverToBoxAdapter(
                  child: FeaturedBooksSection(books: data.featuredBooks),
                ),
              ],
            ),
          ),
        );
      },
      error: (error, stack) => Scaffold(
        appBar: AppBar(),
        body: ErrorStateWidget(
          message: error.toString(),
          onRetry: () => ref.read(homeStateProvider.notifier).fetchDashboard(),
        ),
      ),
      loading: () =>
          Scaffold(appBar: AppBar(), body: const LoadingStateWidget()),
    );
  }
}
