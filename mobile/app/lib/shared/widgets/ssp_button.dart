import 'package:flutter/material.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

/// Defines the visual style variant for [SSPButton].
enum SSPButtonVariant { primary, secondary, outline, text }

/// A premium, reusable button component following the SSP Design System.
/// Supports multiple visual variants, loading states, icons, and analytics integration.
class SSPButton extends StatelessWidget {
  /// The text displayed on the button.
  final String label;

  /// Callback fired when the button is pressed.
  final VoidCallback? onPressed;

  /// Visual style variant of the button. Defaults to [SSPButtonVariant.primary].
  final SSPButtonVariant variant;

  /// Optional icon to display before the label.
  final IconData? icon;

  /// Whether the button is in a loading state (disables press and shows spinner).
  final bool isLoading;

  /// Whether the button should stretch to fill its parent's width.
  final bool isFullWidth;

  /// Optional identifier for analytics tracking.
  final String? analyticsName;

  const SSPButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = SSPButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = true,
    this.analyticsName,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color backgroundColor;
    Color foregroundColor;
    BorderSide? borderSide;

    switch (variant) {
      case SSPButtonVariant.primary:
        backgroundColor = theme.colorScheme.primary;
        foregroundColor = theme.colorScheme.onPrimary;
        break;
      case SSPButtonVariant.secondary:
        backgroundColor = theme.colorScheme.secondaryContainer;
        foregroundColor = theme.colorScheme.onSecondaryContainer;
        break;
      case SSPButtonVariant.outline:
        backgroundColor = Colors.transparent;
        foregroundColor = theme.colorScheme.primary;
        borderSide = BorderSide(color: theme.colorScheme.primary, width: 1.5);
        break;
      case SSPButtonVariant.text:
        backgroundColor = Colors.transparent;
        foregroundColor = theme.colorScheme.primary;
        break;
    }

    final buttonStyle = ElevatedButton.styleFrom(
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      elevation: 0,
      side: borderSide,
      padding: AppSpacing.paddingAllMd,
      shape: const RoundedRectangleBorder(
        borderRadius: AppRadius.borderRadiusLg,
      ),
      textStyle: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.w600),
    );

    Widget content = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
            ),
          ),
          AppSpacing.horizontalSpaceSm,
        ] else if (icon != null) ...[
          Icon(icon, size: 20),
          AppSpacing.horizontalSpaceSm,
        ],
        Text(label),
      ],
    );

    void handlePress() {
      if (isLoading) return;
      // TODO: Log analytics event using analyticsName if provided
      onPressed?.call();
    }

    return variant == SSPButtonVariant.text
        ? TextButton(
            onPressed: onPressed == null ? null : handlePress,
            style: TextButton.styleFrom(
              foregroundColor: foregroundColor,
              textStyle: AppTypography.labelLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            child: content,
          )
        : ElevatedButton(
            onPressed: onPressed == null ? null : handlePress,
            style: buttonStyle,
            child: content,
          );
  }
}
