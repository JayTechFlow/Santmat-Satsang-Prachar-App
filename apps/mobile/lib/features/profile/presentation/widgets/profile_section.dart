import 'package:flutter/material.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';

class ProfileSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;

  const ProfileSection({
    super.key,
    required this.title,
    required this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? SSPColors.darkSurface : SSPColors.lightSurface,
        borderRadius: SSPRadius.brMedium,
        border: Border.all(
          color: isDark ? SSPColors.darkOutline : SSPColors.lightOutline,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(
              left: SSPSpacing.md,
              right: SSPSpacing.md,
              top: SSPSpacing.md,
              bottom: SSPSpacing.xs,
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
                ),
                const SizedBox(width: SSPSpacing.xs),
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: SSPTypography.titleMedium.copyWith(
                      color: SSPColors.textPrimary(context),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ...children,
        ],
      ),
    );
  }
}
