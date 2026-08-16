import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';

/// Canonical List Item component for the Santmat Satsang Prachar Mobile User application.
///
/// Consolidates the app's duplicate row-card pattern into a single accessible
/// row: optional leading widget (thumbnail/icon), a title with optional
/// subtitle, and an optional trailing widget (action button/chevron).
/// Decoupled from image infrastructure — callers supply all widgets.
class SSPListItem extends StatelessWidget {
  /// Optional leading widget (e.g. thumbnail or icon) rendered before the title column.
  final Widget? leading;

  /// Primary text of the list item.
  final String title;

  /// Optional secondary text rendered below [title].
  final String? subtitle;

  /// Maximum lines for [subtitle] before ellipsis truncation. Defaults to 2.
  final int subtitleMaxLines;

  /// Optional trailing widget (e.g. action button or chevron) rendered at the end of the row.
  final Widget? trailing;

  /// Callback executed when the item is tapped.
  /// When null, the item is rendered as a non-interactive row.
  final VoidCallback? onTap;

  /// Whether the item is currently selected. When true, a primary container
  /// tint is applied and the selected semantic flag is exposed.
  final bool isSelected;

  /// Padding inside the item. Defaults to horizontal [SSPSpacing.md] and
  /// vertical [SSPSpacing.sm].
  final EdgeInsetsGeometry padding;

  /// When true, reduces the minimum row height to the 48dp touch target.
  /// When false, the minimum row height is 64dp.
  final bool dense;

  /// Explicit semantic label override for screen readers. When null, the
  /// interactive label defaults to the concatenation of [title] and [subtitle].
  final String? semanticLabel;

  const SSPListItem({
    super.key,
    this.leading,
    required this.title,
    this.subtitle,
    this.subtitleMaxLines = 2,
    this.trailing,
    this.onTap,
    this.isSelected = false,
    this.padding = const EdgeInsets.symmetric(
      horizontal: SSPSpacing.md,
      vertical: SSPSpacing.sm,
    ),
    this.dense = false,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final double minHeight = dense ? SSPSpacing.minTouchTarget : 64.0;
    final Color? selectedColor = isSelected
        ? (isDark
            ? SSPColors.darkPrimaryContainer.withValues(alpha: 0.35)
            : SSPColors.lightPrimaryContainer)
        : null;

    final String defaultLabel = subtitle == null ? title : '$title\n$subtitle';
    final String? itemLabel = onTap == null ? null : (semanticLabel ?? defaultLabel);

    return Semantics(
      container: true,
      selected: isSelected,
      button: onTap != null,
      enabled: onTap != null,
      label: itemLabel,
      child: Material(
        color: Colors.transparent,
        child: Ink(
          color: selectedColor,
          child: InkWell(
            borderRadius: SSPRadius.brLarge,
            onTap: onTap,
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: minHeight),
              child: Padding(
                padding: padding,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    if (leading != null) ...[
                      leading!,
                      SSPSpacing.gapW16,
                    ],
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: SSPTypography.titleMedium.copyWith(
                              color: SSPColors.textPrimary(context),
                            ),
                          ),
                          if (subtitle != null) ...[
                            SSPSpacing.gapH4,
                            Text(
                              subtitle!,
                              maxLines: subtitleMaxLines,
                              overflow: TextOverflow.ellipsis,
                              style: SSPTypography.bodySmall.copyWith(
                                color: SSPColors.textSecondary(context),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (trailing != null) ...[
                      SSPSpacing.gapW8,
                      Align(
                        alignment: Alignment.centerRight,
                        child: trailing!,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}