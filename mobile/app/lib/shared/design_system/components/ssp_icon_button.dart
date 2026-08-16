import 'package:flutter/material.dart';
import '../tokens/animation/ssp_animation.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/spacing/ssp_spacing.dart';

/// Variant options for [SSPIconButton].
enum SSPIconButtonVariant {
  /// Standard icon button with transparent background.
  standard,

  /// Filled icon button with solid primary background.
  filled,

  /// Outlined icon button with primary/surface border.
  outlined,

  /// Tonal icon button with primary container background.
  tonal,
}

/// Canonical Icon Button component for the Santmat Satsang Prachar Mobile User application.
///
/// Implements SSP design tokens, accessibility (48dp min touch target, compulsory semantics),
/// Material 3 variant support (standard, filled, outlined, tonal), loading progress,
/// selection toggle state, tooltips, and reduced-motion feedback.
class SSPIconButton extends StatelessWidget {
  /// Icon or widget rendered inside the button.
  final Widget icon;

  /// Callback executed when button is pressed.
  /// If null, button will be rendered in disabled state.
  final VoidCallback? onPressed;

  /// Compulsory semantic label for screen readers describing the icon action.
  final String semanticLabel;

  /// Optional tooltip message shown on long-press or hover.
  final String? tooltip;

  /// Visual variant of the icon button. Defaults to [SSPIconButtonVariant.standard].
  final SSPIconButtonVariant variant;

  /// Whether the button is selected/active (e.g. favorite, bookmark, repeat).
  final bool isSelected;

  /// Whether the button is in a loading/busy state.
  /// When true, prevents callbacks and renders a circular progress indicator.
  final bool isLoading;

  /// Icon size inside the button. Defaults to 24.0.
  final double iconSize;

  /// Minimum height/width interactive target size. Defaults to 48.0 (Android touch target standard).
  final double minimumSize;

  const SSPIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    required this.semanticLabel,
    this.tooltip,
    this.variant = SSPIconButtonVariant.standard,
    this.isSelected = false,
    this.isLoading = false,
    this.iconSize = 24.0,
    this.minimumSize = SSPSpacing.minTouchTarget,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bool isDisabled = onPressed == null || isLoading;

    // Evaluate colors based on variant, selection, theme, and enabled state
    Color bg;
    Color fg;
    BorderSide borderSide = BorderSide.none;

    if (isDisabled) {
      fg = isDark
          ? SSPColors.softWhite.withValues(alpha: 0.38)
          : SSPColors.templeBrown.withValues(alpha: 0.38);
      bg = variant == SSPIconButtonVariant.filled || variant == SSPIconButtonVariant.tonal
          ? (isDark ? SSPColors.darkOutlineVariant : SSPColors.lightOutlineVariant)
          : Colors.transparent;
      if (variant == SSPIconButtonVariant.outlined) {
        borderSide = BorderSide(
          color: isDark ? SSPColors.darkOutline : SSPColors.lightOutline,
          width: 1.0,
        );
      }
    } else {
      switch (variant) {
        case SSPIconButtonVariant.standard:
          bg = Colors.transparent;
          fg = isSelected
              ? (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary)
              : (isDark ? SSPColors.darkOnSurface : SSPColors.lightOnSurface);
          break;
        case SSPIconButtonVariant.filled:
          bg = isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary;
          fg = isDark ? SSPColors.darkOnPrimary : SSPColors.lightOnPrimary;
          break;
        case SSPIconButtonVariant.outlined:
          bg = Colors.transparent;
          fg = isSelected
              ? (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary)
              : (isDark ? SSPColors.darkOnSurface : SSPColors.lightOnSurface);
          borderSide = BorderSide(
            color: isSelected
                ? (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary)
                : (isDark ? SSPColors.darkOutline : SSPColors.lightOutline),
            width: 1.5,
          );
          break;
        case SSPIconButtonVariant.tonal:
          bg = isDark ? SSPColors.darkPrimaryContainer : SSPColors.lightPrimaryContainer;
          fg = isDark ? SSPColors.darkOnPrimaryContainer : SSPColors.lightOnPrimaryContainer;
          break;
      }
    }

    // Progress indicator widget during loading state
    Widget content;
    if (isLoading) {
      content = SizedBox(
        width: iconSize,
        height: iconSize,
        child: CircularProgressIndicator(
          strokeWidth: 2.2,
          valueColor: AlwaysStoppedAnimation<Color>(fg),
        ),
      );
    } else {
      content = IconTheme.merge(
        data: IconThemeData(color: fg, size: iconSize),
        child: icon,
      );
    }

    // Surface container with circular shape and bounds
    final Widget surface = Container(
      constraints: BoxConstraints(
        minWidth: minimumSize,
        minHeight: minimumSize,
      ),
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
        border: borderSide != BorderSide.none ? Border.all(color: borderSide.color, width: borderSide.width) : null,
      ),
      alignment: Alignment.center,
      child: content,
    );

    // Wrap with press motion
    final Widget pressable = SSPPressable(
      onTap: isDisabled ? null : onPressed,
      child: surface,
    );

    // Accessibility Semantics
    Widget result = Semantics(
      container: true,
      button: true,
      enabled: !isDisabled,
      selected: isSelected,
      label: semanticLabel,
      hint: isLoading ? 'Busy loading' : null,
      value: isLoading ? 'loading' : null,
      child: ExcludeSemantics(child: pressable),
    );

    // Add Tooltip wrapper if specified
    if (tooltip != null && tooltip!.isNotEmpty) {
      result = Tooltip(
        message: tooltip!,
        child: result,
      );
    }

    return result;
  }
}
