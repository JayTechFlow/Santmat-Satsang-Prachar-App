import 'package:flutter/material.dart';
import '../tokens/animation/ssp_animation.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';

/// Canonical Section Header component for the Santmat Satsang Prachar Mobile User application.
///
/// Consolidates the 11 inline section-header copies (title + optional "See All"-style action)
/// into a single component. Implements SSP design tokens, accessibility
/// (48dp min touch target, button semantics), text truncation, and reduced-motion feedback
/// via [SSPPressable].
class SSPSectionHeader extends StatelessWidget {
  /// Title text displayed on the leading edge of the header.
  final String title;

  /// Optional label for the trailing action. Only rendered when [onAction] is also provided.
  final String? actionText;

  /// Callback executed when the trailing action is pressed. If null, the action is hidden.
  final VoidCallback? onAction;

  /// Padding applied around the header. Defaults to horizontal [SSPSpacing.md] / vertical [SSPSpacing.xs].
  final EdgeInsetsGeometry padding;

  /// Explicit semantic label override for the action. Defaults to [actionText].
  final String? semanticLabel;

  const SSPSectionHeader({
    super.key,
    required this.title,
    this.actionText,
    this.onAction,
    this.padding = const EdgeInsets.symmetric(
      horizontal: SSPSpacing.md,
      vertical: SSPSpacing.xs,
    ),
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bool hasAction = actionText != null && onAction != null;

    Widget? action;
    if (hasAction) {
      action = Semantics(
        container: true,
        button: true,
        enabled: true,
        label: semanticLabel ?? actionText,
        child: ExcludeSemantics(
          child: SSPPressable(
            onTap: onAction,
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                minHeight: SSPSpacing.minTouchTarget,
              ),
              child: InkWell(
                borderRadius: SSPRadius.brPill,
                onTap: onAction,
                child: Padding(
                  padding: SSPSpacing.pxSm,
                  child: Text(
                    actionText!,
                    style: SSPTypography.labelLarge.copyWith(
                      color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Text(
              title,
              style: SSPTypography.titleLarge.copyWith(
                color: SSPColors.textPrimary(context),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (hasAction) ...[
            SSPSpacing.gapW8,
            Flexible(
              fit: FlexFit.loose,
              child: action!,
            ),
          ],
        ],
      ),
    );
  }
}