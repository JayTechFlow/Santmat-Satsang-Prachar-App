import 'package:flutter/material.dart';

import '../shared/theme/app_colors.dart';
import '../shared/theme/app_theme_extension.dart';
import '../shared/theme/app_typography.dart';
import '../shared/theme/app_radius.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: AppColors.deepSaffron,
        onPrimary: AppColors.softWhite,
        primaryContainer: AppColors.sacredGold,
        onPrimaryContainer: AppColors.templeBrown,
        secondary: AppColors.sand,
        onSecondary: AppColors.templeBrown,
        secondaryContainer: AppColors.warmIvory,
        onSecondaryContainer: AppColors.templeBrown,
        error: AppColors.softRed,
        onError: AppColors.softWhite,
        surface: AppColors.softWhite,
        onSurface: AppColors.warmBlack,
      ),
      scaffoldBackgroundColor: AppColors.cream,
      textTheme: AppTypography.textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.warmBlack),
        titleTextStyle: AppTypography.title.copyWith(color: AppColors.warmBlack),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.deepSaffron,
          foregroundColor: AppColors.softWhite,
          textStyle: AppTypography.button,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.pill,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.softWhite,
        elevation: 0, // Using custom soft shadows instead
        shape: RoundedRectangleBorder(borderRadius: AppRadius.brLg),
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: AppColors.softWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.softWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.brXl),
      ),
      extensions: const <ThemeExtension<dynamic>>[
        AppThemeExtension(
          success: AppColors.success,
          warning: AppColors.warning,
          info: AppColors.info,
        ),
      ],
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme(
        brightness: Brightness.dark,
        primary: AppColors.deepSaffron,
        onPrimary: AppColors.warmBlack,
        primaryContainer: AppColors.sacredGold,
        onPrimaryContainer: AppColors.warmBlack,
        secondary: AppColors.sand,
        onSecondary: AppColors.warmBlack,
        secondaryContainer: AppColors.deepCharcoal,
        onSecondaryContainer: AppColors.softWhite,
        error: AppColors.softRed,
        onError: AppColors.softWhite,
        surface: AppColors.deepCharcoal,
        onSurface: AppColors.softWhite,
      ),
      scaffoldBackgroundColor: AppColors.warmBlack,
      textTheme: AppTypography.textTheme.apply(
        bodyColor: AppColors.softWhite,
        displayColor: AppColors.softWhite,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.softWhite),
        titleTextStyle: AppTypography.title.copyWith(color: AppColors.softWhite),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.deepSaffron,
          foregroundColor: AppColors.warmBlack,
          textStyle: AppTypography.button,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.pill,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.deepCharcoal,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.brLg),
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: AppColors.deepCharcoal,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.deepCharcoal,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.brXl),
      ),
      extensions: const <ThemeExtension<dynamic>>[
        AppThemeExtension(
          success: AppColors.success,
          warning: AppColors.warning,
          info: AppColors.info,
        ),
      ],
    );
  }
}
