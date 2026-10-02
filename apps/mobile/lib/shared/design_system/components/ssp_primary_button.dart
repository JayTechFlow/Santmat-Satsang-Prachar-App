import 'package:flutter/material.dart';
import '../tokens/animation/ssp_animation.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';

/// Width behavior options for [SSPPrimaryButton].
enum SSPButtonWidth {
  /// Button fills available horizontal space from constraints.
  full,

  /// Button sizes intrinsically based on its label and icons plus padding.
  intrinsic,
}

/// Canonical Primary Button component for the Santmat Satsang Prachar Mobile User application.
///
/// Implements SSP design tokens, accessibility (48dp min touch target, semantics),
/// state management (default, pressed, focused, disabled, loading), responsive width,
/// and reduced-motion feedback.
class SSPPrimaryButton extends StatelessWidget {
  /// Text label displayed on the button.
  final String label;

  /// Callback executed when button is pressed.
  /// If null, button will be rendered in disabled state.
  final VoidCallback? onPressed;

  /// Optional leading icon rendered before label.
  final Widget? leadingIcon;

  /// Optional trailing icon rendered after label.
  final Widget? trailingIcon;

  /// Whether the button is in a loading/busy state.
  /// When true, prevents callbacks and renders a circular progress indicator.
  final bool isLoading;

  /// Width layout behavior of the button (full-width vs intrinsic).
  final SSPButtonWidth width;

  /// Explicit semantic label override for screen readers.
  final String? semanticLabel;

  /// Minimum height constraint. Defaults to 48.0 for touch accessibility.
  final double minimumHeight;

  const SSPPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.leadingIcon,
    this.trailingIcon,
    this.isLoading = false,
    this.width = SSPButtonWidth.full,
    this.semanticLabel,
    this.minimumHeight = SSPSpacing.minTouchTarget,
  });

  /// Convenience constructor accepting a [text] parameter for API compatibility.
  const SSPPrimaryButton.text({
    Key? key,
    required String text,
    required VoidCallback? onPressed,
    Widget? leadingIcon,
    Widget? trailingIcon,
    bool isLoading = false,
    SSPButtonWidth width = SSPButtonWidth.full,
    String? semanticLabel,
    double minimumHeight = SSPSpacing.minTouchTarget,
  }) : this(
         key: key,
         label: text,
         onPressed: onPressed,
         leadingIcon: leadingIcon,
         trailingIcon: trailingIcon,
         isLoading: isLoading,
         width: width,
         semanticLabel: semanticLabel,
         minimumHeight: minimumHeight,
       );

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bool isDisabled = onPressed == null || isLoading;

    // Theme-driven token values
    final Color enabledBg = isDark
        ? SSPColors.darkPrimary
        : SSPColors.lightPrimary;
    final Color enabledFg = isDark
        ? SSPColors.darkOnPrimary
        : SSPColors.lightOnPrimary;

    final Color disabledBg = isDark
        ? SSPColors.darkSurfaceVariant
        : SSPColors.lightOutlineVariant;
    final Color disabledFg = isDark
        ? SSPColors.softWhite.withValues(alpha: 0.38)
        : SSPColors.templeBrown.withValues(alpha: 0.38);

    final Color currentBg = isDisabled ? disabledBg : enabledBg;
    final Color currentFg = isDisabled ? disabledFg : enabledFg;

    final TextStyle labelStyle = SSPTypography.labelLarge.copyWith(
      color: currentFg,
      fontWeight: FontWeight.w600,
    );

    // Build icon or spinner widgets with proper spacing
    Widget? leading;
    if (isLoading) {
      leading = SizedBox(
        width: 18,
        height: 18,
        child: CircularProgressIndicator(
          strokeWidth: 2.2,
          valueColor: AlwaysStoppedAnimation<Color>(currentFg),
        ),
      );
    } else if (leadingIcon != null) {
      leading = IconTheme.merge(
        data: IconThemeData(color: currentFg, size: 20),
        child: leadingIcon!,
      );
    }

    Widget? trailing;
    if (!isLoading && trailingIcon != null) {
      trailing = IconTheme.merge(
        data: IconThemeData(color: currentFg, size: 20),
        child: trailingIcon!,
      );
    }

    // Label layout preserving layout stability during loading state
    final Widget labelWidget = Text(
      label,
      style: labelStyle,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.center,
    );

    final MainAxisSize mainAxisSize = width == SSPButtonWidth.full
        ? MainAxisSize.max
        : MainAxisSize.min;

    final Widget buttonContent = Row(
      mainAxisSize: mainAxisSize,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (leading != null) ...[leading, const SizedBox(width: SSPSpacing.xs)],
        Flexible(
          flex: width == SSPButtonWidth.full ? 1 : 0,
          fit: FlexFit.loose,
          child: ExcludeSemantics(child: labelWidget),
        ),
        if (trailing != null) ...[
          const SizedBox(width: SSPSpacing.xs),
          trailing,
        ],
      ],
    );

    // Base surface with rounded corners and shape tokens
    Widget surface = Container(
      constraints: BoxConstraints(
        minHeight: minimumHeight,
        minWidth: minimumHeight,
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: SSPSpacing.lg,
        vertical: SSPSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: currentBg,
        borderRadius: SSPRadius.brPill,
      ),
      alignment: width == SSPButtonWidth.full ? Alignment.center : null,
      child: buttonContent,
    );

    if (width == SSPButtonWidth.intrinsic) {
      surface = UnconstrainedBox(child: surface);
    }

    // Wrap with SSPPressable for motion interaction feedback
    final Widget pressable = SSPPressable(
      onTap: isDisabled ? null : onPressed,
      child: surface,
    );

    // Accessibility Semantics
    final String effectiveSemantics = semanticLabel ?? label;

    return Semantics(
      container: true,
      button: true,
      enabled: !isDisabled,
      label: effectiveSemantics,
      hint: isLoading ? 'Busy loading' : null,
      value: isLoading ? 'loading' : null,
      child: pressable,
    );
  }
}
