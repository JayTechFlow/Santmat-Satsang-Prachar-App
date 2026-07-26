import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_typography.dart';
import '../../../../shared/widgets/ssp_app_bar.dart';
import '../../../../shared/widgets/ssp_search_bar.dart';
import '../../../../shared/widgets/ssp_section_header.dart';
import '../../../../shared/widgets/ssp_prayer_card.dart';
import '../../../../shared/widgets/ssp_loading.dart';
import '../../../../shared/widgets/ssp_error_state.dart';
import '../../../../shared/widgets/ssp_empty_state.dart';
import '../providers/satsang_providers.dart';
import '../../domain/entities/satsang_category_entity.dart';

class SatsangHomePage extends ConsumerWidget {
  const SatsangHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(satsangHomeStateProvider);

    if (state.isLoading) {
      return Scaffold(
        appBar: SSPAppBar(title: 'Stuti & Vinati'),
        body: const SSPLoadingWidget(),
      );
    }

    if (state.error != null) {
      return Scaffold(
        appBar: SSPAppBar(title: 'Stuti & Vinati'),
        body: SSPErrorState(
          message: state.error!,
          onRetry: () => ref.read(satsangHomeStateProvider.notifier).loadHomeData(),
        ),
      );
    }

    return Scaffold(
      appBar: SSPAppBar(
        title: 'Stuti & Vinati',
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {}, // Filter options
          ),
        ],
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              children: [
                AppSpacing.gapH16,
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16),
                  child: SSPSearchBar(
                    hintText: 'Search prayers, aarti, stuti...',
                    readOnly: true,
                    onTap: () => context.push('/search'),
                  ),
                ),
                AppSpacing.gapH32,
                SSPSectionHeader(
                  title: 'Featured Stuti',
                  icon: Icons.auto_awesome_rounded,
                ),
              ],
            ),
          ),
          if (state.featuredSatsangs.isEmpty)
            SliverToBoxAdapter(
              child: SSPEmptyState(
                title: 'No Featured Stuti',
                message: 'Check back soon for curated content.',
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final item = state.featuredSatsangs[index];
                  return SSPPrayerCard(
                    title: item.title,
                    subtitle: item.speaker.name,
                    timeText: 'Morning',
                    imageUrl: item.thumbnailUrl,
                    isPlaying: false,
                    onPlayPause: () {},
                    onTap: () => context.push('/satsang/details/${item.id}'),
                  );
                },
                childCount: state.featuredSatsangs.length,
              ),
            ),
          SliverToBoxAdapter(
            child: Column(
              children: [
                AppSpacing.gapH24,
                SSPSectionHeader(
                  title: 'All Prayers',
                  icon: Icons.library_books_rounded,
                ),
              ],
            ),
          ),
          if (state.latestSatsangs.isEmpty)
            SliverToBoxAdapter(
              child: SSPEmptyState(
                title: 'No Prayers Available',
                message: 'We are updating our library.',
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final item = state.latestSatsangs[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16, vertical: AppSpacing.sp8),
                    child: Container(
                      padding: AppSpacing.p16,
                      decoration: BoxDecoration(
                        color: AppColors.surface(context),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border(context)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: AppSpacing.p12,
                            decoration: BoxDecoration(
                              color: AppColors.sacredGold.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.menu_book_rounded, color: AppColors.sacredGold),
                          ),
                          AppSpacing.gapW16,
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.title,
                                  style: AppTypography.title.copyWith(fontSize: 18),
                                ),
                                AppSpacing.gapH4,
                                Text(
                                  item.speaker.name,
                                  style: AppTypography.body.copyWith(color: AppColors.textSecondary(context)),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted(context), size: 16),
                        ],
                      ),
                    ),
                  );
                },
                childCount: state.latestSatsangs.length,
              ),
            ),
          const SliverToBoxAdapter(child: AppSpacing.gapH64),
        ],
      ),
    );
  }
}
