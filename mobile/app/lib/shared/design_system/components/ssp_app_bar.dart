import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/elevation/ssp_elevation.dart';
import '../tokens/typography/ssp_typography.dart';

/// Canonical transparent App Bar component for the Santmat Satsang Prachar Mobile User application.
///
/// Wraps Material's [AppBar] with SSP design tokens over a transparent,
/// elevation-free surface so that every page renders a consistent header.
/// The app's AppBarTheme (transparent background, elevation 0, titleLarge) is
/// inherited; shape and system overlay styling are intentionally not overridden.
class SSPAppBar extends StatelessWidget implements PreferredSizeWidget {
  /// Title text displayed in the app bar.
  final String title;

  /// Optional leading widget (for example a back button or drawer toggle).
  /// When null, [automaticallyImplyLeading] governs the inferred back button.
  final Widget? leading;

  /// Trailing action widgets, typically [SSPIconButton] instances.
  /// Actions are passed by callers; no management logic is applied.
  final List<Widget> actions;

  /// Whether the title is centered horizontally.
  final bool centerTitle;

  /// Whether an implied leading back button is inferred when [leading] is null.
  final bool automaticallyImplyLeading;

  /// Optional override for the title text style.
  final TextStyle? titleTextStyle;

  /// Optional background color override; defaults to fully transparent.
  final Color? backgroundColor;

  /// Whether a subtle drop shadow is rendered beneath the app bar.
  final bool showShadow;

  /// Semantic label for screen readers, used in place of the title text
  /// when the title is non-text or requires a localized announcement.
  final String? semanticTitle;

  const SSPAppBar({
    super.key,
    required this.title,
    this.leading,
    this.actions = const [],
    this.centerTitle = true,
    this.automaticallyImplyLeading = true,
    this.titleTextStyle,
    this.backgroundColor,
    this.showShadow = false,
    this.semanticTitle,
  });

  /// Standard toolbar height so the app bar integrates with [Scaffold.appBar].
  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    Widget titleWidget = Text(
      title,
      style: titleTextStyle ??
          SSPTypography.titleLarge.copyWith(color: SSPColors.textPrimary(context)),
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );

    if (semanticTitle != null) {
      titleWidget = Semantics(
        label: semanticTitle,
        excludeSemantics: true,
        child: titleWidget,
      );
    }

    return AppBar(
      title: titleWidget,
      leading: leading,
      actions: actions,
      centerTitle: centerTitle,
      automaticallyImplyLeading: automaticallyImplyLeading,
      backgroundColor: backgroundColor ?? Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
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