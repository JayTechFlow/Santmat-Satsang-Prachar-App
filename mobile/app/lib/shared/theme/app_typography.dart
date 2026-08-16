import 'package:flutter/material.dart';
import '../design_system/tokens/typography/ssp_typography.dart';

/// Legacy AppTypography bridge delegating to canonical SSPTypography
class AppTypography {
  const AppTypography._();

  static TextStyle get display => SSPTypography.displayLarge;
  static TextStyle get headline => SSPTypography.headlineLarge;
  static TextStyle get title => SSPTypography.titleLarge;
  static TextStyle get subtitle => SSPTypography.titleMedium;
  static TextStyle get body => SSPTypography.bodyMedium;
  static TextStyle get caption => SSPTypography.bodySmall;
  static TextStyle get label => SSPTypography.labelMedium;
  static TextStyle get button => SSPTypography.labelLarge;

  static TextTheme get textTheme => SSPTypography.textTheme;
}

