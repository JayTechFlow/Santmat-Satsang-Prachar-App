import 'package:flutter/material.dart';

class AppResponsive {
  const AppResponsive._();

  static const double mobileBreakPoint = 600.0;
  static const double tabletBreakPoint = 900.0;
  static const double desktopBreakPoint = 1200.0;

  static bool isMobile(BuildContext context) =>
      MediaQuery.sizeOf(context).width < mobileBreakPoint;

  static bool isTablet(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= mobileBreakPoint &&
      MediaQuery.sizeOf(context).width < desktopBreakPoint;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= desktopBreakPoint;

  static int getCrossAxisCount(
    BuildContext context, {
    int mobile = 2,
    int tablet = 3,
    int desktop = 4,
  }) {
    if (isDesktop(context)) return desktop;
    if (isTablet(context)) return tablet;
    return mobile;
  }
}
