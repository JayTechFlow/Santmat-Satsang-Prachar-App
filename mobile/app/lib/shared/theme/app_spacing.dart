import 'package:flutter/material.dart';

class AppSpacing {
  const AppSpacing._();

  static const double xxxs = 2.0;
  static const double xxs = 4.0;
  static const double xs = 8.0;
  static const double sm = 16.0;
  static const double md = 24.0;
  static const double lg = 32.0;
  static const double xlg = 40.0;
  static const double xxlg = 48.0;
  static const double xxxlg = 64.0;

  static const EdgeInsets paddingAllXs = EdgeInsets.all(xs);
  static const EdgeInsets paddingAllSm = EdgeInsets.all(sm);
  static const EdgeInsets paddingAllMd = EdgeInsets.all(md);
  static const EdgeInsets paddingAllLg = EdgeInsets.all(lg);

  static const SizedBox verticalSpaceXs = SizedBox(height: xs);
  static const SizedBox verticalSpaceSm = SizedBox(height: sm);
  static const SizedBox verticalSpaceMd = SizedBox(height: md);
  static const SizedBox verticalSpaceLg = SizedBox(height: lg);
  static const SizedBox verticalSpaceXxlg = SizedBox(height: xxlg);

  static const SizedBox horizontalSpaceXs = SizedBox(width: xs);
  static const SizedBox horizontalSpaceSm = SizedBox(width: sm);
  static const SizedBox horizontalSpaceMd = SizedBox(width: md);
  static const SizedBox horizontalSpaceLg = SizedBox(width: lg);
}
