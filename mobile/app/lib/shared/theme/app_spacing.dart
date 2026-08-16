import 'package:flutter/material.dart';
import '../design_system/tokens/spacing/ssp_spacing.dart';

/// Legacy AppSpacing bridge delegating to canonical SSPSpacing
class AppSpacing {
  const AppSpacing._();

  static const double sp4 = SSPSpacing.xs;
  static const double sp8 = SSPSpacing.sm;
  static const double sp12 = 12.0;
  static const double sp16 = SSPSpacing.md;
  static const double sp20 = 20.0;
  static const double sp24 = SSPSpacing.lg;
  static const double sp32 = SSPSpacing.xl;
  static const double sp40 = 40.0;
  static const double sp48 = SSPSpacing.xxl;
  static const double sp64 = SSPSpacing.xxxl;

  static const EdgeInsets p4 = SSPSpacing.pXs;
  static const EdgeInsets p8 = SSPSpacing.pSm;
  static const EdgeInsets p12 = EdgeInsets.all(12.0);
  static const EdgeInsets p16 = SSPSpacing.pMd;
  static const EdgeInsets p20 = EdgeInsets.all(20.0);
  static const EdgeInsets p24 = SSPSpacing.pLg;
  static const EdgeInsets p32 = SSPSpacing.pXl;
  static const EdgeInsets p40 = EdgeInsets.all(40.0);
  static const EdgeInsets p48 = SSPSpacing.pXxl;
  static const EdgeInsets p64 = EdgeInsets.all(SSPSpacing.xxxl);

  static const SizedBox gapH4 = SSPSpacing.gapH4;
  static const SizedBox gapH8 = SSPSpacing.gapH8;
  static const SizedBox gapH12 = SSPSpacing.gapH12;
  static const SizedBox gapH16 = SSPSpacing.gapH16;
  static const SizedBox gapH20 = SizedBox(height: 20.0);
  static const SizedBox gapH24 = SSPSpacing.gapH24;
  static const SizedBox gapH32 = SSPSpacing.gapH32;
  static const SizedBox gapH40 = SizedBox(height: 40.0);
  static const SizedBox gapH48 = SSPSpacing.gapH48;
  static const SizedBox gapH64 = SizedBox(height: SSPSpacing.xxxl);

  static const SizedBox gapW4 = SSPSpacing.gapW4;
  static const SizedBox gapW8 = SSPSpacing.gapW8;
  static const SizedBox gapW12 = SSPSpacing.gapW12;
  static const SizedBox gapW16 = SSPSpacing.gapW16;
  static const SizedBox gapW20 = SizedBox(width: 20.0);
  static const SizedBox gapW24 = SSPSpacing.gapW24;
  static const SizedBox gapW32 = SSPSpacing.gapW32;
  static const SizedBox gapW40 = SizedBox(width: 40.0);
  static const SizedBox gapW48 = SSPSpacing.gapW48;
  static const SizedBox gapW64 = SizedBox(width: SSPSpacing.xxxl);
}

