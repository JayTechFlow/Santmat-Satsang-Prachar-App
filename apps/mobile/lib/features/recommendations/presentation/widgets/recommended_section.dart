import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_card.dart';
import '../../../../shared/design_system/components/ssp_section_header.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../domain/entities/recommendation_entity.dart';
import '../providers/recommendation_providers.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';

class RecommendedSection extends ConsumerWidget {
  final void Function(RecommendationEntity item)? onItemTap;
  final String title;

  const RecommendedSection({
    super.key,
    this.onItemTap,
    this.title = 'Recommended for You',
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(recommendationNotifierProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary;

    if (state.isLoading) {
      return const SSPLoadingState(message: 'Loading recommendations...');
    }

    if (state.error != null && state.recommendations.isEmpty) {
      return SSPErrorState(
        message: 'Could not load recommendations',
        onRetry: () => ref.read(recommendationNotifierProvider.notifier).loadRecommendations(forceRefresh: true),
      );
    }

    if (state.recommendations.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SSPSectionHeader(
          title: title,
          actionText: 'Refresh',
          onAction: () => ref.read(recommendationNotifierProvider.notifier).loadRecommendations(forceRefresh: true),
        ),
        SizedBox(
          height: 220,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: SSPSpacing.sm),
            itemCount: state.recommendations.length,
            itemBuilder: (context, index) {
              final item = state.recommendations[index];
              return _RecommendationCard(
                item: item,
                onTap: () => onItemTap?.call(item),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _RecommendationCard extends StatelessWidget {
  final RecommendationEntity item;
  final VoidCallback? onTap;

  const _RecommendationCard({
    required this.item,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary;

    return Container(
      width: 170,
      margin: const EdgeInsets.symmetric(horizontal: SSPSpacing.xs),
      child: SSPCard(
        onTap: onTap,
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(SSPSpacing.md)),
                  child: Container(
                    height: 100,
                    width: double.infinity,
                    color: primaryColor.withValues(alpha: 0.2),
                    child: item.imageUrl.isNotEmpty
                        ? SSPImage(
                            item.imageUrl,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: 100,
                            errorWidget: (_, __, ___) => Center(
                              child: Icon(SSPIcons.favorite, color: primaryColor, size: 36),
                            ),
                          )
                        : Center(
                            child: Icon(SSPIcons.favorite, color: primaryColor, size: 36),
                          ),
                  ),
                ),
                Positioned(
                  top: SSPSpacing.xs,
                  left: SSPSpacing.xs,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: primaryColor.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(SSPSpacing.xs),
                    ),
                    child: Text(
                      item.category.toUpperCase(),
                      style: SSPTypography.labelSmall.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: SSPSpacing.pSm,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: SSPTypography.titleSmall.copyWith(fontWeight: FontWeight.bold),
                  ),
                  SSPSpacing.gapH4,
                  Text(
                    item.subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: SSPTypography.bodySmall,
                  ),
                  SSPSpacing.gapH4,
                  Text(
                    item.reason,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: SSPTypography.bodySmall.copyWith(
                      fontStyle: FontStyle.italic,
                      color: primaryColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}