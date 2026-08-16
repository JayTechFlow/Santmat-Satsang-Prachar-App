import 'package:flutter/material.dart';

/// Authoritative SSP Spacing System
/// Based on an 8dp baseline grid rhythm for consistent layout and senior-friendly touch targets.
class SSPSpacing {
  const SSPSpacing._();

  // Raw Spacing Values (8dp grid + 4dp micro-step)
  static const double none = 0.0;
  static const double xxs = 2.0;
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  static const double xxxl = 64.0;

  // Minimum Touch Target Constraint (Android accessibility default)
  static const double minTouchTarget = 48.0;

  // Symmetric Padding Presets
  static const EdgeInsets pNone = EdgeInsets.zero;
  static const EdgeInsets pXs = EdgeInsets.all(xs);
  static const EdgeInsets pSm = EdgeInsets.all(sm);
  static const EdgeInsets pMd = EdgeInsets.all(md);
  static const EdgeInsets pLg = EdgeInsets.all(lg);
  static const EdgeInsets pXl = EdgeInsets.all(xl);
  static const EdgeInsets pXxl = EdgeInsets.all(xxl);

  // Horizontal Padding Presets
  static const EdgeInsets pxSm = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets pxMd = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets pxLg = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets pxXl = EdgeInsets.symmetric(horizontal: xl);

  // Vertical Padding Presets
  static const EdgeInsets pySm = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets pyMd = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets pyLg = EdgeInsets.symmetric(vertical: lg);

  // Vertical Gap Widgets
  static const SizedBox gapH4 = SizedBox(height: xs);
  static const SizedBox gapH8 = SizedBox(height: sm);
  static const SizedBox gapH12 = SizedBox(height: 12.0);
  static const SizedBox gapH16 = SizedBox(height: md);
  static const SizedBox gapH24 = SizedBox(height: lg);
  static const SizedBox gapH32 = SizedBox(height: xl);
  static const SizedBox gapH48 = SizedBox(height: xxl);

  // Horizontal Gap Widgets
  static const SizedBox gapW4 = SizedBox(width: xs);
  static const SizedBox gapW8 = SizedBox(width: sm);
  static const SizedBox gapW12 = SizedBox(width: 12.0);
  static const SizedBox gapW16 = SizedBox(width: md);
  static const SizedBox gapW24 = SizedBox(width: lg);
  static const SizedBox gapW32 = SizedBox(width: xl);
  static const SizedBox gapW48 = SizedBox(width: xxl);
}
