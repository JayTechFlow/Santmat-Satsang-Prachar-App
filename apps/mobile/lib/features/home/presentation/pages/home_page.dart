import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/home_providers.dart';
import '../widgets/category_action_grid.dart';
import '../widgets/home_banner_carousel.dart';
import '../widgets/home_search_bar.dart';
import '../widgets/latest_bhajans_section.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';

/// Reconstructed HomePage for Santmat Satsang Prachar Mobile User Application.
///
/// Features:
/// 1. Top Devotional Header (SSPAppBar.devotional).
/// 2. Top Search Bar ("अपने पसंद का भजन सुनें").
/// 3. 4-Slot Home Banner Carousel (5s auto-scroll, horizontal snap swipe, tap deep-linking).
/// 4. 2-Column Category Grid ("ऑडियो" and "स्तुति-बिनती").
/// 5. Latest Bhajans Section ("नए भजन" with artwork thumbnail, animated equalizer bars when playing, play/pause toggle, and duration label).
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final homeState = ref.watch(homeStateProvider);
    final Color bgColor = isDark
        ? const Color(0xFF181614)
        : const Color(0xFFFFFDF9);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const SSPAppBar.devotional(),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () =>
              ref.read(homeStateProvider.notifier).refreshDashboard(),
          color: const Color(0xFFD97706),
          child: homeState.when(
            loading: () => const SSPLoadingState(),
            error: (err, stack) => SSPErrorState(
              message: err.toString(),
              onRetry: () =>
                  ref.read(homeStateProvider.notifier).refreshDashboard(),
            ),
            data: (data) {
              return CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 12.0,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        // 1. Top Search Bar
                        const HomeSearchBar(),

                        const SizedBox(height: 16.0),

                        // 2. Canonical 16:9 4-Slot Banner Carousel from CMS
                        if (data.banners.isNotEmpty) ...[
                          HomeBannerCarousel(banners: data.banners),
                          const SizedBox(height: 16.0),
                        ],


                        // 3. 2-Column Category Grid
                        const CategoryActionGrid(),

                        const SizedBox(height: 20.0),

                        // 4. Latest Bhajans Section ("नए भजन")
                        LatestBhajansSection(latestAudios: data.latestAudios),

                        const SizedBox(height: 24.0),
                      ]),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
