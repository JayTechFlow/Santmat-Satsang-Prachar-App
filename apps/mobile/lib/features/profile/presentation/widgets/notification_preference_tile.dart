import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'preference_tile.dart';
import '../../../../l10n/gen/app_localizations.dart';

class NotificationPreferenceTile extends ConsumerWidget {
  final bool isEnabled;
  final Function(bool) onToggled;

  const NotificationPreferenceTile({
    super.key,
    required this.isEnabled,
    required this.onToggled,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    return PreferenceTile(
      icon: Icons.notifications_active_outlined,
      title: l10n.notifications,
      trailing: Switch(value: isEnabled, onChanged: onToggled),
    );
  }
}
