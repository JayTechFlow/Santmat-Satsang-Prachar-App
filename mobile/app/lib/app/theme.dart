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
        primary: AppColors.lightPrimary,
        onPrimary: AppColors.lightOnPrimary,
        primaryContainer: AppColors.lightPrimaryContainer,
        onPrimaryContainer: AppColors.lightOnPrimaryContainer,
        secondary: AppColors.lightSecondary,
        onSecondary: AppColors.lightOnSecondary,
        secondaryContainer: AppColors.lightSecondaryContainer,
        onSecondaryContainer: AppColors.lightOnSecondaryContainer,
        error: AppColors.lightError,
        onError: AppColors.lightOnError,
        surface: AppColors.lightSurface,
        onSurface: AppColors.lightOnSurface,
      ),
      textTheme: AppTypography.textTheme,
      scaffoldBackgroundColor: AppColors.lightSurface,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.lightSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.lightOnSurface),
        titleTextStyle: AppTypography.titleLarge.copyWith(
          color: AppColors.lightOnSurface,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.lightPrimary,
          foregroundColor: AppColors.lightOnPrimary,
          textStyle: AppTypography.labelLarge,
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadius.borderRadiusLg,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.softWhite,
        elevation: 0, // Using soft shadows in custom cards instead
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderRadiusLg),
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: AppRadius.radiusXl),
        ),
      ),
      dialogTheme: const DialogThemeData(
        backgroundColor: AppColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderRadiusXl),
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
        primary: AppColors.darkPrimary,
        onPrimary: AppColors.darkOnPrimary,
        primaryContainer: AppColors.darkPrimaryContainer,
        onPrimaryContainer: AppColors.darkOnPrimaryContainer,
        secondary: AppColors.darkSecondary,
        onSecondary: AppColors.darkOnSecondary,
        secondaryContainer: AppColors.darkSecondaryContainer,
        onSecondaryContainer: AppColors.darkOnSecondaryContainer,
        error: AppColors.darkError,
        onError: AppColors.darkOnError,
        surface: AppColors.darkSurface,
        onSurface: AppColors.darkOnSurface,
      ),
      textTheme: AppTypography.textTheme.apply(
        bodyColor: AppColors.darkOnSurface,
        displayColor: AppColors.darkOnSurface,
      ),
      scaffoldBackgroundColor: AppColors.darkSurface,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.darkOnSurface),
        titleTextStyle: AppTypography.titleLarge.copyWith(
          color: AppColors.darkOnSurface,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.darkPrimary,
          foregroundColor: AppColors.darkOnPrimary,
          textStyle: AppTypography.labelLarge,
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadius.borderRadiusLg,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.darkSurface, // We will use layered cards
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderRadiusLg),
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: AppRadius.radiusXl),
        ),
      ),
      dialogTheme: const DialogThemeData(
        backgroundColor: AppColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderRadiusXl),
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
