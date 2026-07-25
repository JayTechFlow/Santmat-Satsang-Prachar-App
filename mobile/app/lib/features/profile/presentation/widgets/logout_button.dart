import 'package:flutter/material.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../l10n/gen/app_localizations.dart';

class LogoutButton extends StatelessWidget {
  final VoidCallback onLogout;

  const LogoutButton({super.key, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: OutlinedButton.icon(
        onPressed: onLogout,
        icon: Icon(Icons.logout, color: theme.colorScheme.error),
        label: Text(
          l10n.logout,
          style: TextStyle(color: theme.colorScheme.error),
        ),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: theme.colorScheme.error),
          minimumSize: const Size.fromHeight(48),
        ),
      ),
    );
  }
}
