import 'package:flutter/material.dart';

import '../shared/theme/app_colors.dart';
import '../shared/theme/app_theme_extension.dart';
import '../shared/theme/app_typography.dart';

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
      textTheme: AppTypography.textTheme,
      scaffoldBackgroundColor: AppColors.darkSurface,
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
