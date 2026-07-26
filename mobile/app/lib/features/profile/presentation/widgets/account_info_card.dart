import 'package:flutter/material.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../domain/entities/account_information_entity.dart';
import '../../../../l10n/gen/app_localizations.dart';
import 'package:intl/intl.dart';

class AccountInfoCard extends StatelessWidget {
  final AccountInformationEntity accountInfo;

  const AccountInfoCard({super.key, required this.accountInfo});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dateStr = DateFormat.yMMMd().format(accountInfo.memberSince);

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.sp16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.memberSince(dateStr),
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppSpacing.sp4),
          Text(
            l10n.appVersion(accountInfo.applicationVersion),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
