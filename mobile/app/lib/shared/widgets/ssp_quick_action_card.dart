import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import 'ssp_card.dart';

class SSPQuickActionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color? iconColor;
  final VoidCallback onTap;

  const SSPQuickActionCard({
    super.key,
    required this.title,
    required this.icon,
    required this.onTap,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveIconColor = iconColor ?? theme.colorScheme.primary;

    return SSPCard(
      onTap: onTap,
      padding: AppSpacing.paddingAllMd,
      hasShadow: false,
      color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: AppSpacing
                .paddingAllSm, // Wait, it's AppSpacing.paddingAllSm. We'll use AppSpacing.sm below.
            decoration: BoxDecoration(
              color: effectiveIconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Icon(icon, color: effectiveIconColor, size: 28),
            ),
          ),
          AppSpacing.verticalSpaceSm,
          Text(
            title,
            style: AppTypography.labelLarge.copyWith(
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
