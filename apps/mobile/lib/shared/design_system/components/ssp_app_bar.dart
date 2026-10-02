import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/back_navigation_controller.dart';
import '../../../../core/navigation/root_navigator.dart';
import '../../../../features/notifications/presentation/providers/notifications_providers.dart';
import '../../theme/app_theme_provider.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/elevation/ssp_elevation.dart';

/// Canonical Top Header App Bar component matching Client_design TopHeader.tsx.
///
/// Features deep maroon background (#7F1D1D light / #201D1A dark),
/// Mukta extra bold title "संतमत सत्संग प्रचार", Mukta medium motto "॥ सत्य ही हमारा धर्म है ॥",
/// left drawer menu button, and right actions (Theme Toggle + Notification Bell with unread pulse badge).
class SSPAppBar extends ConsumerWidget implements PreferredSizeWidget {
  /// Primary title text displayed in the app bar. Defaults to "संतमत सत्संग प्रचार".
  final String title;

  /// Optional subtitle displayed below title. Defaults to "॥ सत्य ही हमारा धर्म है ॥".
  final String? subtitle;

  /// Optional leading widget (e.g. back button or drawer toggle).
  final Widget? leading;

  /// Optional leading width override.
  final double? leadingWidth;

  /// Optional trailing action widgets. When omitted, default Theme Toggle
  /// and Notification Bell with unread pulse badge are rendered.
  final List<Widget>? actions;

  /// Whether the title and subtitle are centered horizontally.
  final bool centerTitle;

  /// Whether an implied leading button is inferred when [leading] is null.
  final bool automaticallyImplyLeading;

  /// Optional override for the title text style.
  final TextStyle? titleTextStyle;

  /// Optional background color override; defaults to deep maroon (#7F1D1D light / #201D1A dark).
  final Color? backgroundColor;

  /// Whether a subtle drop shadow is rendered beneath the app bar.
  final bool showShadow;

  /// Semantic label for screen readers.
  final String? semanticTitle;

  /// Custom callback for theme toggle action.
  final VoidCallback? onThemeToggle;

  /// Custom callback for notification action.
  final VoidCallback? onNotificationTap;

  /// Optional bottom widget (e.g. TabBar).
  final PreferredSizeWidget? bottom;

  const SSPAppBar({
    super.key,
    this.title = 'संतमत सत्संग प्रचार',
    this.subtitle = '॥ सत्य ही हमारा धर्म है ॥',
    this.leading,
    this.leadingWidth,
    this.actions,
    this.centerTitle = true,
    this.automaticallyImplyLeading = true,
    this.titleTextStyle,
    this.backgroundColor,
    this.showShadow = false,
    this.semanticTitle,
    this.onThemeToggle,
    this.onNotificationTap,
    this.bottom,
  });

  /// Canonical Devotional Brand Header variant (for Home and primary devotional landings).
  const SSPAppBar.devotional({
    super.key,
    this.title = 'संतमत सत्संग प्रचार',
    this.subtitle = '॥ सत्य ही हमारा धर्म है ॥',
    this.leading,
    this.leadingWidth,
    this.actions,
    this.centerTitle = true,
    this.automaticallyImplyLeading = true,
    this.titleTextStyle,
    this.backgroundColor,
    this.showShadow = true,
    this.semanticTitle,
    this.onThemeToggle,
    this.onNotificationTap,
    this.bottom,
  });

  /// Standard screen header variant with custom title and optional back navigation.
  const SSPAppBar.standard({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.leadingWidth,
    this.actions,
    this.centerTitle = true,
    this.automaticallyImplyLeading = true,
    this.titleTextStyle,
    this.backgroundColor,
    this.showShadow = false,
    this.semanticTitle,
    this.onThemeToggle,
    this.onNotificationTap,
    this.bottom,
  });

  @override
  Size get preferredSize =>
      Size.fromHeight(60.0 + (bottom?.preferredSize.height ?? 0.0));

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark =
        themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            Theme.of(context).brightness == Brightness.dark);

    final defaultBgColor = isDark
        ? SSPColors.darkSurface
        : SSPColors.headerMaroon;

    Widget? leadingWidget = leading;
    if (leadingWidget == null && automaticallyImplyLeading) {
      // Whether a Back button makes sense is decided by the navigation stack,
      // not by `ModalRoute.canPop`: the canonical Back interception registers a
      // `PopScope` with `canPop: false` on every route, so `canPop` is always
      // false.
      //
      // `rootStackDepth()` is authoritative for the real app and is immune to
      // dialogs and bottom sheets (which are routes of the same navigator). It
      // reports 0 when the app's root navigator is not attached — for example
      // when the widget is used standalone in a test or a nested navigator — so
      // in that case fall back to the enclosing navigator.
      final depth = rootStackDepth();
      final canGoBack =
          depth > 1 || (depth == 0 && Navigator.of(context).canPop());
      if (canGoBack) {
        // Route the AppBar back button through the same canonical policy that
        // the Android system Back button uses, so the two can never disagree
        // (PHASE 6). Nested pages pop to their logical parent, top-level
        // secondary pages go to Home, and Home is never reachable by Back.
        leadingWidget = IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFFFDE68A)),
          onPressed: () => ref
              .read(backNavigationControllerProvider)
              .handleBack(context, source: BackSource.appBar),
          tooltip: 'Back',
        );
      } else {
        leadingWidget = null;
      }
    }

    Widget titleContent = Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: centerTitle
          ? CrossAxisAlignment.center
          : CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style:
              titleTextStyle ??
              TextStyle(
                fontFamily: 'Mukta',
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: isDark
                    ? const Color(0xFFFBBF24)
                    : const Color(0xFFFDE68A),
                height: 1.1,
                letterSpacing: -0.3,
              ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        if (subtitle != null && subtitle!.isNotEmpty) ...[
          const SizedBox(height: 1),
          Text(
            subtitle!,
            style: TextStyle(
              fontFamily: 'Mukta',
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: isDark
                  ? const Color(0xFFA8A29E)
                  : const Color(0xFFFDE68A).withValues(alpha: 0.85),
              height: 1.1,
              letterSpacing: 0.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ],
    );

    if (semanticTitle != null) {
      titleContent = Semantics(
        label: semanticTitle,
        excludeSemantics: true,
        child: titleContent,
      );
    }

    final unreadCount = actions == null
        ? ref.watch(
            unreadNotificationsCountProvider.select(
              (v) => v.asData?.value ?? 0,
            ),
          )
        : 0;

    final defaultActions = [
      IconButton(
        icon: Icon(
          isDark ? Icons.wb_sunny_rounded : Icons.dark_mode_rounded,
          color: isDark ? const Color(0xFFFBBF24) : const Color(0xFFFDE68A),
          size: 20,
        ),
        onPressed: onThemeToggle ?? () => toggleThemeMode(ref),
        tooltip: 'थीम बदलें',
      ),
      Stack(
        alignment: Alignment.center,
        children: [
          IconButton(
            icon: const Icon(
              Icons.notifications_rounded,
              color: Color(0xFFFDE68A),
              size: 22,
            ),
            onPressed:
                onNotificationTap ?? () => context.push('/notifications'),
            tooltip: 'सूचनाएँ',
          ),
          if (unreadCount > 0)
            Positioned(
              right: 10,
              top: 10,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: const Color(0xFFD97706),
                  shape: BoxShape.circle,
                  border: Border.all(color: defaultBgColor, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFD97706).withValues(alpha: 0.6),
                      blurRadius: 4,
                      spreadRadius: 1,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
      const SizedBox(width: 4),
    ];

    return AppBar(
      title: titleContent,
      leading: leadingWidget,
      leadingWidth: leadingWidth,
      actions: actions ?? defaultActions,
      centerTitle: centerTitle,
      automaticallyImplyLeading: false,
      backgroundColor: backgroundColor ?? defaultBgColor,
      elevation: 0,
      scrolledUnderElevation: 0,
      toolbarHeight: 60,
      bottom: bottom,
      flexibleSpace: showShadow
          ? Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                height: 2,
                decoration: BoxDecoration(
                  boxShadow: SSPElevation.subtle(context),
                ),
              ),
            )
          : null,
    );
  }
}
