import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppGradients {
  const AppGradients._();

  static LinearGradient heroBanner(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return LinearGradient(
      colors: isDark
          ? [AppColors.deepCharcoal, AppColors.warmBlack]
          : [AppColors.deepSaffron.withValues(alpha: 0.8), AppColors.deepSaffron],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  static LinearGradient background(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return LinearGradient(
      colors: isDark
          ? [AppColors.warmBlack, AppColors.deepCharcoal]
          : [AppColors.cream, AppColors.softWhite],
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
    );
  }

  static LinearGradient prayerCard(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return LinearGradient(
      colors: isDark
          ? [AppColors.deepCharcoal.withValues(alpha: 0.6), AppColors.warmBlack.withValues(alpha: 0.9)]
          : [AppColors.sacredGold.withValues(alpha: 0.1), AppColors.softWhite],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  static LinearGradient audioPlayer(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return LinearGradient(
      colors: isDark
          ? [AppColors.deepCharcoal, AppColors.warmBlack]
          : [AppColors.sand.withValues(alpha: 0.4), AppColors.cream],
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
    );
  }

  static LinearGradient primaryButton = const LinearGradient(
    colors: [AppColors.sacredGold, AppColors.deepSaffron],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static LinearGradient premiumOverlay = LinearGradient(
    colors: [
      Colors.black.withValues(alpha: 0.0),
      Colors.black.withValues(alpha: 0.7),
    ],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
