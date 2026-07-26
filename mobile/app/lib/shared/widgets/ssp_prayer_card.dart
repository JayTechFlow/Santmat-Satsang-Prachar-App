import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import 'ssp_quote_card.dart';
import 'ssp_mini_player.dart';

class SSPPrayerCard extends StatelessWidget {
  final String timeTitle;
  final String timeSubtitle;
  final IconData timeIcon;
  final Color themeColor;
  final LinearGradient backgroundGradient;

  final String title;
  final String subtitle;
  final String imageUrl;
  final String durationText;
  final String quoteText;

  final VoidCallback onPlay;
  final VoidCallback onLyrics;
  final VoidCallback onFavorite;
  final VoidCallback onShare;

  const SSPPrayerCard({
    super.key,
    required this.timeTitle,
    required this.timeSubtitle,
    required this.timeIcon,
    required this.themeColor,
    required this.backgroundGradient,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.durationText,
    required this.quoteText,
    required this.onPlay,
    required this.onLyrics,
    required this.onFavorite,
    required this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: backgroundGradient,
        borderRadius: AppRadius.borderRadiusXl,
        border: Border.all(color: themeColor.withValues(alpha: 0.1)),
      ),
      padding: AppSpacing.paddingAllLg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(timeIcon, color: themeColor, size: 36),
              AppSpacing.horizontalSpaceMd,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      timeTitle,
                      style: AppTypography.titleLarge.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary(context),
                      ),
                    ),
                    Text(
                      timeSubtitle,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary(context),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          AppSpacing.verticalSpaceLg,

          // Inner White Card (Player and Actions)
          Container(
            padding: AppSpacing.paddingAllLg,
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: AppRadius.borderRadiusLg,
              boxShadow: [
                BoxShadow(
                  color: themeColor.withValues(alpha: 0.1),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                SSPMiniPlayer(
                  title: title,
                  subtitle: subtitle,
                  imageUrl: imageUrl,
                  durationText: durationText,
                  themeColor: themeColor,
                  onPlay: onPlay,
                ),
                AppSpacing.verticalSpaceSm,
                const Divider(),
                AppSpacing.verticalSpaceSm,
                // Actions Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildAction(
                      context,
                      Icons.lyrics_outlined,
                      'लिरिक्स पढ़ें',
                      onLyrics,
                    ),
                    _buildAction(
                      context,
                      Icons.favorite_border_rounded,
                      'पसंदीदा में जोड़ें',
                      onFavorite,
                    ),
                    _buildAction(
                      context,
                      Icons.share_rounded,
                      'शेयर करें',
                      onShare,
                    ),
                  ],
                ),
              ],
            ),
          ),
          AppSpacing.verticalSpaceLg,

          // Embedded Quote Card
          SSPQuoteCard(text: quoteText),
        ],
      ),
    );
  }

  Widget _buildAction(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, color: AppColors.textPrimary(context)),
          AppSpacing.verticalSpaceXs,
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary(context),
            ),
          ),
        ],
      ),
    );
  }
}
