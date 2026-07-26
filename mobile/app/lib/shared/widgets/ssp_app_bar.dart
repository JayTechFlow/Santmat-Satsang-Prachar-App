import 'package:flutter/material.dart';
import '../theme/app_typography.dart';
import '../theme/app_colors.dart';

class SSPAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;

  const SSPAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.actions,
    this.leading,
    this.centerTitle = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    Widget titleWidget = Text(
      title,
      style: AppTypography.titleLarge.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.maroon, // Specific to the design
      ),
    );

    if (subtitle != null) {
      titleWidget = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          titleWidget,
          const SizedBox(height: 2),
          Text(
            subtitle!,
            style: AppTypography.labelLarge.copyWith(
              color: AppColors.textSecondary(context),
            ),
          ),
        ],
      );
    }

    return AppBar(
      title: titleWidget,
      centerTitle: centerTitle,
      backgroundColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      toolbarHeight: subtitle != null ? 70.0 : kToolbarHeight,
      leading:
          leading ??
          IconButton(
            icon: const Icon(Icons.menu_rounded),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
      actions: actions,
      iconTheme: IconThemeData(
        color: isDark ? AppColors.darkOnSurface : AppColors.lightOnSurface,
      ),
    );
  }

  @override
  Size get preferredSize =>
      Size.fromHeight(subtitle != null ? 70.0 : kToolbarHeight);
}
