import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../authentication/presentation/providers/auth_state_provider.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_icons.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_typography.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_hero_banner.dart';
import '../../../../shared/widgets/ssp_search_bar.dart';
import '../../../../shared/widgets/ssp_quick_action_card.dart';
import '../../../../shared/widgets/ssp_section_header.dart';
import '../../../../shared/widgets/ssp_audio_tile.dart';
import '../../../../shared/widgets/ssp_loading.dart';
import '../../../../shared/widgets/ssp_error_state.dart';
import '../../../../shared/utils/app_responsive.dart';
import '../providers/home_providers.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeStateProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.value?.user;
    final displayName = user?.displayName ?? 'Devotee';

    return homeState.when(
      data: (data) {
        final banner = data.banners.isNotEmpty ? data.banners.first : null;
        final suvichar = data.dailyQuote;

        return Scaffold(
          appBar: SSPAppBar(
            title: 'सत्संग प्रचार',
            centerTitle: false,
            actions: [
              IconButton(icon: const Icon(AppIcons.info), onPressed: () {}),
              IconButton(icon: const Icon(AppIcons.profile), onPressed: () {}),
              AppSpacing.horizontalSpaceSm,
            ],
          ),
          body: RefreshIndicator(
            color: AppColors.deepSaffron,
            onRefresh: () =>
                ref.read(homeStateProvider.notifier).refreshDashboard(),
            child: CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: AppSpacing.paddingAllLg,
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      Text(
                        'जय गुरुदेव, $displayName',
                        style: AppTypography.headlineMedium.copyWith(
                          color: AppColors.textPrimary(context),
                        ),
                      ),
                      AppSpacing.verticalSpaceSm,
                      Text(
                        'Welcome to your daily spiritual journey.',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary(context),
                        ),
                      ),
                      AppSpacing.verticalSpaceLg,

                      // Search Bar
                      SSPSearchBar(onTap: () {}, onVoiceTap: () {}),
                      AppSpacing.verticalSpaceLg,

                      // Hero Banner with Daily Quote
                      if (banner != null)
                        SSPHeroBanner(
                          title: banner.title,
                          imageUrl: banner.imageUrl,
                          suvicharText: suvichar?.quoteText,
                          onShareTap: () {},
                          onSaveTap: () {},
                        ),
                      AppSpacing.verticalSpaceLg,

                      // Quick Actions Grid Header
                      const SSPSectionHeader(title: 'Quick Actions'),
                      AppSpacing.verticalSpaceMd,
                    ]),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                  ),
                  sliver: SliverGrid(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: AppResponsive.getCrossAxisCount(
                        context,
                        mobile: 3,
                        tablet: 4,
                        desktop: 6,
                      ),
                      mainAxisSpacing: AppSpacing.sm,
                      crossAxisSpacing: AppSpacing.sm,
                      childAspectRatio: 1.0,
                    ),
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final action = data.quickActions[index];
                      IconData iconData = AppIcons.info;
                      if (action.iconName == 'library_music') {
                        iconData = AppIcons.library;
                      }
                      if (action.iconName == 'book') {
                        iconData = Icons.book_rounded;
                      }
                      if (action.iconName == 'event') {
                        iconData = Icons.event_rounded;
                      }
                      if (action.iconName == 'video_library') {
                        iconData = Icons.video_library_rounded;
                      }

                      return SSPQuickActionCard(
                        title: action.title,
                        icon: iconData,
                        onTap: () {},
                      );
                    }, childCount: data.quickActions.length),
                  ),
                ),
                if (data.latestAudios.isNotEmpty)
                  SliverPadding(
                    padding: const EdgeInsets.only(
                      top: AppSpacing.xxlg,
                      left: AppSpacing.lg,
                      right: AppSpacing.lg,
                    ),
                    sliver: SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SSPSectionHeader(
                            title: 'Latest Bhajans',
                            actionLabel: 'See All',
                            onActionTap: () {},
                          ),
                          AppSpacing.verticalSpaceMd,
                        ],
                      ),
                    ),
                  ),
                if (data.latestAudios.isNotEmpty)
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final audio = data.latestAudios[index];
                          final durationParts = audio.duration.toString().split(
                            '.',
                          );
                          final formattedDuration = durationParts.isNotEmpty
                              ? durationParts[0]
                              : '0:00';

                          return Padding(
                            padding: const EdgeInsets.only(
                              bottom: AppSpacing.sm,
                            ),
                            child: SSPAudioTile(
                              title: audio.title,
                              subtitle: audio.speaker,
                              imageUrl: audio.audioUrl,
                              duration: formattedDuration,
                              onTap: () {},
                              onPlayTap: () {},
                              onMoreTap: () {},
                            ),
                          );
                        },
                        childCount: data.latestAudios.length > 3
                            ? 3
                            : data.latestAudios.length,
                      ),
                    ),
                  ),
                const SliverSafeArea(
                  sliver: SliverToBoxAdapter(child: AppSpacing.verticalSpaceLg),
                ),
              ],
            ),
          ),
        );
      },
      error: (error, stack) => Scaffold(
        appBar: const SSPAppBar(title: ''),
        body: SSPErrorState(
          message: error.toString(),
          onRetry: () => ref.read(homeStateProvider.notifier).fetchDashboard(),
        ),
      ),
      loading: () => const Scaffold(
        appBar: SSPAppBar(title: ''),
        body: SSPLoading(message: 'Loading your spiritual dashboard...'),
      ),
    );
  }
}
