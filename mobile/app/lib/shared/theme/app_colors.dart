import 'package:flutter/material.dart';
import '../design_system/tokens/colors/ssp_colors.dart';

/// Legacy AppColors bridge delegating to canonical SSPColors
class AppColors {
  const AppColors._();

  static const Color deepSaffron = SSPColors.deepSaffron;
  static const Color sacredGold = SSPColors.sacredGold;
  static const Color sand = SSPColors.sand;
  static const Color warmIvory = SSPColors.warmIvory;
  static const Color softWhite = SSPColors.softWhite;
  static const Color cream = SSPColors.cream;
  static const Color templeBrown = SSPColors.templeBrown;
  static const Color forestGreen = SSPColors.success;
  static const Color softRed = SSPColors.error;
  static const Color warmBlack = SSPColors.warmBlack;
  static const Color deepCharcoal = SSPColors.deepCharcoal;

  static const Color success = SSPColors.success;
  static const Color warning = SSPColors.warning;
  static const Color info = SSPColors.info;

  static Color background(BuildContext context) => SSPColors.background(context);
  static Color surface(BuildContext context) => SSPColors.surface(context);
  static Color textPrimary(BuildContext context) => SSPColors.textPrimary(context);
  static Color textSecondary(BuildContext context) => SSPColors.textSecondary(context);
  static Color textMuted(BuildContext context) => SSPColors.textTertiary(context);
  static Color border(BuildContext context) => SSPColors.outline(context);
  static Color divider(BuildContext context) => SSPColors.divider(context);

  static Color glassBackground(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? deepCharcoal.withValues(alpha: 0.6)
          : softWhite.withValues(alpha: 0.7);
}

