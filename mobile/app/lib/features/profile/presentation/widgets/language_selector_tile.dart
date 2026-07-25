import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'preference_tile.dart';
import '../../../../l10n/gen/app_localizations.dart';

class LanguageSelectorTile extends ConsumerWidget {
  final String currentLanguage;
  final Function(String) onLanguageChanged;

  const LanguageSelectorTile({
    super.key,
    required this.currentLanguage,
    required this.onLanguageChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    return PreferenceTile(
      icon: Icons.language,
      title: l10n.language,
      subtitle: currentLanguage == 'en' ? 'English' : 'हिंदी',
      onTap: () {
        // Show dialog or bottom sheet to select language
      },
      trailing: const Icon(Icons.chevron_right),
    );
  }
}
