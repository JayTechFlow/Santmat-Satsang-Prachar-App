import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/icons/ssp_icons.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_tertiary_button.dart';

/// Canonical Empty State component for the Santmat Satsang Prachar Mobile User application.
///
/// Implements SSP design tokens, accessibility (summarizing container semantics),
/// centered icon-backdrop visual, optional intrinsic tertiary action, and a compact
/// density variant. Stateless and free of business logic.
class SSPEmptyState extends StatelessWidget {
  /// Short headline describing what is missing.
  final String title;

  /// Supporting description of the empty condition.
  final String message;

  /// Optional icon rendered inside the circular backdrop. Defaults to [SSPIcons.info].
  final IconData? icon;

  /// Optional label for the tertiary action. Only rendered when [onAction] is provided.
  final String? actionLabel;

  /// Callback executed when the tertiary action is pressed. If null, the action is hidden.
  final VoidCallback? onAction;

  /// Reduces vertical gaps for denser layouts. Defaults to false.
  final bool compact;

  const SSPEmptyState({
    super.key,
    required this.title,
    required this.message,
    this.icon,
    this.actionLabel,
    this.onAction,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color primaryFg = isDark
        ? SSPColors.darkPrimary
        : SSPColors.lightPrimary;
    final double gapLarge = compact ? SSPSpacing.md : SSPSpacing.lg;

    final Widget iconBackdrop = Container(
      width: SSPSpacing.xxxl,
      height: SSPSpacing.xxxl,
      decoration: BoxDecoration(
        color: isDark
            ? SSPColors.darkPrimaryContainer
            : SSPColors.lightPrimaryContainer,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Icon(icon ?? SSPIcons.info, size: 40, color: primaryFg),
    );

    return Semantics(
      container: true,
      label: '$title. $message',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ExcludeSemantics(child: iconBackdrop),
          SizedBox(height: gapLarge),
          ExcludeSemantics(
            child: Text(
              title,
              style: SSPTypography.titleMedium.copyWith(
                color: SSPColors.textPrimary(context),
              ),
              textAlign: TextAlign.center,
            ),
          ),
          SSPSpacing.gapH8,
          ExcludeSemantics(
            child: Text(
              message,
              style: SSPTypography.bodyMedium.copyWith(
                color: SSPColors.textSecondary(context),
              ),
              textAlign: TextAlign.center,
            ),
          ),
          if (actionLabel != null && onAction != null) ...[
            SizedBox(height: gapLarge),
            SSPTertiaryButton(label: actionLabel!, onPressed: onAction),
          ],
        ],
      ),
    );
  }
}
