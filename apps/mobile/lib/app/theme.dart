import 'package:flutter/material.dart';

import '../shared/design_system/tokens/colors/ssp_colors.dart';
import '../shared/design_system/tokens/radius/ssp_radius.dart';
import '../shared/design_system/tokens/typography/ssp_typography.dart';
import '../shared/theme/app_theme_extension.dart';

/// Master SSP Theme Configuration
/// Configures Material 3 with canonical SSP Design Tokens.
class SSPTheme {
  const SSPTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: SSPColors.lightPrimary,
        onPrimary: SSPColors.lightOnPrimary,
        primaryContainer: SSPColors.lightPrimaryContainer,
        onPrimaryContainer: SSPColors.lightOnPrimaryContainer,
        secondary: SSPColors.lightSecondary,
        onSecondary: SSPColors.lightOnSecondary,
        secondaryContainer: SSPColors.lightSecondaryContainer,
        onSecondaryContainer: SSPColors.lightOnSecondaryContainer,
        tertiary: SSPColors.purpleStutiPrimary,
        onTertiary: Colors.white,
        tertiaryContainer: Color(0xFFF3E8FF),
        onTertiaryContainer: SSPColors.purpleStutiDark,
        error: SSPColors.error,
        onError: Colors.white,
        surface: SSPColors.lightSurface,
        onSurface: SSPColors.lightOnSurface,
        surfaceContainerHighest: SSPColors.lightSurfaceVariant,
        onSurfaceVariant: SSPColors.lightOnSurfaceVariant,
        outline: SSPColors.lightOutline,
        outlineVariant: SSPColors.lightOutlineVariant,
      ),
      scaffoldBackgroundColor: SSPColors.lightBackground,
      textTheme: SSPTypography.textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: SSPColors.headerMaroon,
        foregroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        titleTextStyle: SSPTypography.titleLarge.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: SSPColors.lightPrimary,
          foregroundColor: SSPColors.lightOnPrimary,
          textStyle: SSPTypography.labelLarge,
          shape: SSPRadius.shapePill,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          minimumSize: const Size(48, 48),
        ),
      ),
      cardTheme: CardThemeData(
        color: SSPColors.lightSurface,
        elevation: 0,
        shape: SSPRadius.shapeLarge,
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: SSPColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: SSPRadius.rExtraLarge),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: SSPColors.lightSurface,
        elevation: 0,
        shape: SSPRadius.shapeExtraLarge,
      ),
      dividerTheme: const DividerThemeData(
        color: SSPColors.lightOutlineVariant,
        thickness: 1,
        space: 1,
      ),
      extensions: const <ThemeExtension<dynamic>>[
        AppThemeExtension(
          success: SSPColors.success,
          warning: SSPColors.warning,
          info: SSPColors.info,
        ),
      ],
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme(
        brightness: Brightness.dark,
        primary: SSPColors.darkPrimary,
        onPrimary: SSPColors.darkOnPrimary,
        primaryContainer: SSPColors.darkPrimaryContainer,
        onPrimaryContainer: SSPColors.darkOnPrimaryContainer,
        secondary: SSPColors.darkSecondary,
        onSecondary: SSPColors.darkOnSecondary,
        secondaryContainer: SSPColors.darkSecondaryContainer,
        onSecondaryContainer: SSPColors.darkOnSecondaryContainer,
        tertiary: SSPColors.purpleStutiPrimary,
        onTertiary: Colors.white,
        tertiaryContainer: Color(0xFF3B0764),
        onTertiaryContainer: Color(0xFFF3E8FF),
        error: SSPColors.error,
        onError: Colors.white,
        surface: SSPColors.darkSurface,
        onSurface: SSPColors.darkOnSurface,
        surfaceContainerHighest: SSPColors.darkSurfaceVariant,
        onSurfaceVariant: SSPColors.darkOnSurfaceVariant,
        outline: SSPColors.darkOutline,
        outlineVariant: SSPColors.darkOutlineVariant,
      ),
      scaffoldBackgroundColor: SSPColors.darkBackground,
      textTheme: SSPTypography.textTheme.apply(
        bodyColor: SSPColors.darkOnSurface,
        displayColor: SSPColors.darkOnSurface,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SSPColors.headerMaroon,
        foregroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        titleTextStyle: SSPTypography.titleLarge.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: SSPColors.darkPrimary,
          foregroundColor: SSPColors.darkOnPrimary,
          textStyle: SSPTypography.labelLarge,
          shape: SSPRadius.shapePill,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          minimumSize: const Size(48, 48),
        ),
      ),
      cardTheme: CardThemeData(
        color: SSPColors.darkSurface,
        elevation: 0,
        shape: SSPRadius.shapeLarge,
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: SSPColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: SSPRadius.rExtraLarge),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: SSPColors.darkSurface,
        elevation: 0,
        shape: SSPRadius.shapeExtraLarge,
      ),
      dividerTheme: const DividerThemeData(
        color: SSPColors.darkOutlineVariant,
        thickness: 1,
        space: 1,
      ),
      extensions: const <ThemeExtension<dynamic>>[
        AppThemeExtension(
          success: SSPColors.success,
          warning: SSPColors.warning,
          info: SSPColors.info,
        ),
      ],
    );
  }
}

/// Legacy AppTheme wrapper preserving exact backward compatibility
class AppTheme {
  const AppTheme._();

  static ThemeData get lightTheme => SSPTheme.lightTheme;
  static ThemeData get darkTheme => SSPTheme.darkTheme;
}

