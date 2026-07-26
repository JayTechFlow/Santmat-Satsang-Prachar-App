import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_icons.dart';

class SSPSearchBar extends StatelessWidget {
  final String hintText;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onTap;
  final bool readOnly;
  final TextEditingController? controller;

  const SSPSearchBar({
    super.key,
    this.hintText = 'Search...',
    this.onChanged,
    this.onTap,
    this.readOnly = false,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface(context),
        borderRadius: AppRadius.pill,
        border: Border.all(color: AppColors.border(context)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp16, vertical: AppSpacing.sp4),
      child: Row(
        children: [
          Icon(AppIcons.search, color: AppColors.textMuted(context)),
          AppSpacing.gapW12,
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              onTap: onTap,
              readOnly: readOnly,
              style: AppTypography.body,
              decoration: InputDecoration(
                hintText: hintText,
                hintStyle: AppTypography.body.copyWith(color: AppColors.textMuted(context)),
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
