import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/icons/ssp_icons.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_tertiary_button.dart';

/// Canonical Error State component for the Santmat Satsang Prachar Mobile User application.
///
/// Implements SSP design tokens, accessibility (summarizing container semantics),
/// an error-tinted circular icon backdrop, optional intrinsic retry action, and
/// plain English defaults that callers may localize. Stateless and free of
/// business logic.
class SSPErrorState extends StatelessWidget {
  /// Headline describing the failure. Defaults to 'Something went wrong'.
  final String? title;

  /// Supporting description of the error condition. Required.
  final String message;

  /// Label for the retry action. Defaults to 'Retry'. Only rendered when [onRetry] is provided.
  final String? retryLabel;

  /// Callback executed when the retry action is pressed. If null, the action is hidden.
  final VoidCallback? onRetry;

  /// Optional icon rendered inside the circular backdrop. Defaults to [SSPIcons.error].
  final IconData? icon;

  const SSPErrorState({
    super.key,
    this.title,
    required this.message,
    this.retryLabel,
    this.onRetry,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final String effectiveTitle = title ?? 'Something went wrong';
    final Color errorColor = SSPColors.error;

    final Widget iconBackdrop = Container(
      width: SSPSpacing.xxxl,
      height: SSPSpacing.xxxl,
      decoration: BoxDecoration(
        color: errorColor.withValues(alpha: 0.1),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Icon(icon ?? SSPIcons.error, size: 40, color: errorColor),
    );

    return Semantics(
      container: true,
      label: '$effectiveTitle. $message',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ExcludeSemantics(child: iconBackdrop),
          SSPSpacing.gapH24,
          ExcludeSemantics(
            child: Text(
              effectiveTitle,
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
          if (onRetry != null) ...[
            SSPSpacing.gapH24,
            SSPTertiaryButton(label: retryLabel ?? 'Retry', onPressed: onRetry),
          ],
        ],
      ),
    );
  }
}
