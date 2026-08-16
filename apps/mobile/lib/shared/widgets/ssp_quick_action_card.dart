import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_animations.dart';

class SSPActionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;
  final Color? color;

  const SSPActionCard({
    super.key,
    required this.title,
    required this.icon,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = color ?? AppColors.deepSaffron;

    return SSPPressable(
      onTap: onTap,
      child: Container(
        padding: AppSpacing.p20,
        decoration: BoxDecoration(
          color: bgColor.withValues(alpha: 0.1),
          borderRadius: AppRadius.brLg,
          border: Border.all(color: bgColor.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Container(
              padding: AppSpacing.p12,
              decoration: BoxDecoration(
                color: bgColor.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: bgColor, size: 28),
            ),
            AppSpacing.gapW16,
            Expanded(
              child: Text(
                title,
                style: AppTypography.title.copyWith(fontSize: 18),
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: bgColor.withValues(alpha: 0.5), size: 16),
          ],
        ),
      ),
    );
  }
}
