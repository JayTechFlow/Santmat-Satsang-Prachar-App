import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import '../theme/app_colors.dart';
import '../theme/app_icons.dart';

class PlaceholderPage extends StatelessWidget {
  final String title;

  const PlaceholderPage({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Padding(
          padding: AppSpacing.p24,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                AppIcons.info,
                size: 64,
                color: AppColors.deepSaffron,
              ),
              AppSpacing.gapH24,
              Text(
                title,
                style: AppTypography.headline,
                textAlign: TextAlign.center,
              ),
              AppSpacing.gapH12,
              Text(
                'This module is currently under development.',
                style: AppTypography.body.copyWith(
                  color: AppColors.textMuted(context),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
