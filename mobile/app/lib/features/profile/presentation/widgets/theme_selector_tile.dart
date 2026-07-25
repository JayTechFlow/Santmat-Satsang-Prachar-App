import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'preference_tile.dart';
import '../../../../l10n/gen/app_localizations.dart';

class ThemeSelectorTile extends ConsumerWidget {
  final String currentTheme;
  final Function(String) onThemeChanged;

  const ThemeSelectorTile({
    super.key,
    required this.currentTheme,
    required this.onThemeChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    String getThemeName() {
      switch (currentTheme) {
        case 'light':
          return l10n.themeLight;
        case 'dark':
          return l10n.themeDark;
        default:
          return l10n.themeSystem;
      }
    }

    return PreferenceTile(
      icon: Icons.palette_outlined,
      title: l10n.theme,
      subtitle: getThemeName(),
      onTap: () {
        // Show dialog or bottom sheet to select theme
      },
      trailing: const Icon(Icons.chevron_right),
    );
  }
}
