import 'package:flutter/material.dart';
import '../theme/app_typography.dart';
import '../theme/app_colors.dart';

class SSPAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;

  const SSPAppBar({
    super.key,
    required this.title,
    this.actions,
    this.leading,
    this.centerTitle = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppBar(
      title: Text(
        title,
        style: AppTypography.titleLarge.copyWith(
          fontWeight: FontWeight.w600,
          color: isDark ? AppColors.darkOnSurface : AppColors.lightOnSurface,
        ),
      ),
      centerTitle: centerTitle,
      backgroundColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: leading,
      actions: actions,
      iconTheme: IconThemeData(
        color: isDark ? AppColors.darkOnSurface : AppColors.lightOnSurface,
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
