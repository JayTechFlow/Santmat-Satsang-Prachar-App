import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

class SSPLoadingWidget extends StatelessWidget {
  final String? message;

  const SSPLoadingWidget({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.deepSaffron),
          ),
          if (message != null) ...[
            AppSpacing.gapH16,
            Text(
              message!,
              style: AppTypography.body.copyWith(color: AppColors.textMuted(context)),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}
