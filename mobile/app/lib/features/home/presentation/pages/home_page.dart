import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/home_providers.dart';
import '../widgets/daily_quote_card.dart';
import '../widgets/featured_banner_carousel.dart';
import '../widgets/latest_audio_section.dart';
import '../widgets/quick_actions_grid.dart';
import '../widgets/notification_icon.dart';
import '../widgets/profile_avatar.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/components/ssp_icon_button.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../l10n/gen/app_localizations.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeStateProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: homeState.maybeWhen(
        data: (data) => SSPAppBar(
          title: AppLocalizations.of(context)!.appTitle,
          actions: [
            SSPIconButton(
              icon: const Icon(Icons.search_rounded),
              semanticLabel: 'Search',
              onPressed: () => context.push('/search'),
            ),
            NotificationIcon(count: data.notificationCount),
            const SizedBox(width: 8),
            ProfileAvatar(
              fallbackInitial: 'U', // Update when user profile feature is available
              onTap: () => context.push('/settings'),
            ),
            const SizedBox(width: 16),
          ],
        ),
        orElse: () => SSPAppBar(
          title: AppLocalizations.of(context)!.appTitle,
          actions: [
            SSPIconButton(
              icon: const Icon(Icons.search_rounded),
              semanticLabel: 'Search',
              onPressed: () => context.push('/search'),
            ),
            NotificationIcon(count: 0),
            const SizedBox(width: 8),
            ProfileAvatar(
              fallbackInitial: '',
              onTap: () => context.push('/settings'),
            ),
            const SizedBox(width: 16),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(homeStateProvider.notifier).refreshDashboard(),
        child: homeState.when(
          loading: () => const SSPLoadingState(),
          error: (err, stack) => SSPErrorState(
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
