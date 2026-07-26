import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_gradients.dart';
import '../theme/app_animations.dart';

enum SSPButtonVariant { primary, secondary, outline, text }

class SSPButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final SSPButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final bool isFullWidth;
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
    Color backgroundColor = Colors.transparent;
    Color foregroundColor = AppColors.textPrimary(context);
    BorderSide? borderSide;
    Gradient? gradient;

    switch (variant) {
      case SSPButtonVariant.primary:
        gradient = AppGradients.primaryButton;
        foregroundColor = Colors.white;
        break;
      case SSPButtonVariant.secondary:
        backgroundColor = AppColors.surface(context);
        foregroundColor = AppColors.textPrimary(context);
        borderSide = BorderSide(color: AppColors.border(context));
        break;
      case SSPButtonVariant.outline:
        foregroundColor = AppColors.deepSaffron;
        borderSide = BorderSide(color: AppColors.deepSaffron, width: 1.5);
        break;
      case SSPButtonVariant.text:
        foregroundColor = AppColors.deepSaffron;
        break;
    }

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
          AppSpacing.gapW8,
        ] else if (icon != null) ...[
          Icon(icon, size: 20, color: foregroundColor),
          AppSpacing.gapW8,
        ],
        Text(
          label,
          style: AppTypography.button.copyWith(color: foregroundColor),
        ),
      ],
    );

    final bool isDisabled = onPressed == null || isLoading;

    Widget buttonSurface = Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: gradient == null ? (isDisabled ? AppColors.border(context) : backgroundColor) : null,
        gradient: isDisabled ? null : gradient,
        borderRadius: AppRadius.pill,
        border: borderSide != null ? Border.all(color: borderSide.color, width: borderSide.width) : null,
      ),
      child: content,
    );

    if (isDisabled) {
      return Opacity(opacity: 0.6, child: buttonSurface);
    }

    return SSPPressable(
      onTap: () {
        if (!isLoading && onPressed != null) {
          onPressed!();
        }
      },
      child: buttonSurface,
    );
  }
}
