import 'package:flutter/material.dart';
import '../tokens/colors/ssp_colors.dart';
import '../tokens/icons/ssp_icons.dart';
import '../tokens/radius/ssp_radius.dart';
import '../tokens/spacing/ssp_spacing.dart';
import '../tokens/typography/ssp_typography.dart';
import 'ssp_primary_button.dart' show SSPButtonWidth;
import 'ssp_tertiary_button.dart';

/// Canonical confirmation dialog component for the Santmat Satsang Prachar Mobile User application.
///
/// Used for destructive and confirm flows throughout the app. Defaults to a
/// warning icon + error-styled confirm action when [isDestructive] is true,
/// and an info icon + primary-styled confirm action otherwise.
///
/// The dialog surface colors are taken from [SSPColors] so it renders
/// correctly even under a bare [MaterialApp] test harness. Callers localize
/// [title], [message], [confirmLabel] and [cancelLabel] themselves.
class SSPConfirmationDialog extends StatelessWidget {
  /// The title displayed at the top of the dialog.
  final String title;

  /// The descriptive message shown beneath the title.
  final String message;

  /// Label for the positive (confirm) action; defaults to 'Confirm'.
  final String? confirmLabel;

  /// Label for the negative (cancel) action; defaults to 'Cancel'.
  final String? cancelLabel;

  /// Optional callback invoked before the dialog dismisses with `true`.
  /// Callers may perform work here; the dialog itself pops with `true`.
  final VoidCallback? onConfirm;

  /// Optional callback invoked before the dialog dismisses with `false`.
  /// When null, the cancel action simply pops the dialog with `false`.
  final VoidCallback? onCancel;

  /// When true, the dialog uses destructive styling: a warning icon in error
  /// color and a confirm action with an error-colored background.
  final bool isDestructive;

  /// Optional leading icon for the dialog header. Defaults to a warning icon
  /// when [isDestructive] is true, otherwise an info icon.
  final IconData? icon;

  /// Creates the canonical confirmation dialog.
  const SSPConfirmationDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmLabel,
    this.cancelLabel,
    this.onConfirm,
    this.onCancel,
    this.isDestructive = false,
    this.icon,
  });

  /// Shows the dialog on top of the current route and resolves to:
  ///
  /// - `true` when the confirm action is pressed,
  /// - `false` when the cancel action is pressed,
  /// - `null` when dismissed by barrier tap, system back, or route removal.
  static Future<bool?> show(
    BuildContext context, {
    required String title,
    required String message,
    String? confirmLabel,
    String? cancelLabel,
    bool isDestructive = false,
    IconData? icon,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) => SSPConfirmationDialog(
        title: title,
        message: message,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        isDestructive: isDestructive,
        icon: icon,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final IconData headerIcon =
        icon ?? (isDestructive ? SSPIcons.warning : SSPIcons.info);
    final Color headerColor = isDestructive
        ? SSPColors.error
        : (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary);
    final Color confirmBg = isDestructive
        ? SSPColors.error
        : (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary);
    final Color confirmFg = isDestructive
        ? SSPColors.softWhite
        : (isDark ? SSPColors.darkOnPrimary : SSPColors.lightOnPrimary);

    return AlertDialog(
      backgroundColor: isDark ? SSPColors.darkSurface : SSPColors.lightSurface,
      shape: SSPRadius.shapeExtraLarge,
      icon: Icon(headerIcon, size: 32, color: headerColor),
      title: Text(
        title,
        style: SSPTypography.titleLarge.copyWith(
          color: SSPColors.textPrimary(context),
        ),
      ),
      content: Text(
        message,
        style: SSPTypography.bodyMedium.copyWith(
          color: SSPColors.textSecondary(context),
        ),
      ),
      actions: [
        Wrap(
          spacing: SSPSpacing.sm,
          runSpacing: SSPSpacing.sm,
          alignment: WrapAlignment.end,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            SSPTertiaryButton(
              label: cancelLabel ?? 'Cancel',
              onPressed:
                  onCancel ?? (() => Navigator.of(context).pop(false)),
              width: SSPButtonWidth.intrinsic,
            ),
            _DialogActionButton(
              label: confirmLabel ?? 'Confirm',
              onPressed: () {
                onConfirm?.call();
                Navigator.of(context).pop(true);
              },
              backgroundColor: confirmBg,
              foregroundColor: confirmFg,
            ),
          ],
        ),
      ],
    );
  }
}

/// Pill-shaped confirm action with a solid [backgroundColor]
/// (error red for destructive flows, brand primary otherwise).
class _DialogActionButton extends StatelessWidget {
  /// Visible label of the action.
  final String label;

  /// Callback executed when the action is pressed.
  final VoidCallback onPressed;

  /// Solid pill background color.
  final Color backgroundColor;

  /// Label color drawn on top of [backgroundColor].
  final Color foregroundColor;

  /// Builds an accessible, 48dp-tall pill confirm action.
  const _DialogActionButton({
    required this.label,
    required this.onPressed,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      button: true,
      enabled: true,
      label: label,
      child: Material(
        color: backgroundColor,
        borderRadius: SSPRadius.brPill,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onPressed,
          child: Container(
            constraints: const BoxConstraints(
              minHeight: SSPSpacing.minTouchTarget,
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: SSPSpacing.lg,
              vertical: SSPSpacing.sm,
            ),
            alignment: Alignment.center,
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: SSPTypography.labelLarge.copyWith(
                color: foregroundColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}