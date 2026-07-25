import 'package:flutter/material.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../l10n/gen/app_localizations.dart';

class DeleteAccountButton extends StatelessWidget {
  final VoidCallback onDelete;

  const DeleteAccountButton({super.key, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md,
      ),
      child: TextButton.icon(
        onPressed: onDelete,
        icon: Icon(Icons.delete_forever, color: theme.colorScheme.error),
        label: Text(
          l10n.deleteAccount,
          style: TextStyle(color: theme.colorScheme.error),
        ),
      ),
    );
  }
}
