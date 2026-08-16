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
        showDialog(
          context: context,
          builder: (context) => SimpleDialog(
            title: Text(l10n.theme),
            children: [
              SimpleDialogOption(
                onPressed: () {
                  Navigator.pop(context);
                  onThemeChanged('system');
                },
                child: Text(l10n.themeSystem),
              ),
              SimpleDialogOption(
                onPressed: () {
                  Navigator.pop(context);
                  onThemeChanged('light');
                },
                child: Text(l10n.themeLight),
              ),
              SimpleDialogOption(
                onPressed: () {
                  Navigator.pop(context);
                  onThemeChanged('dark');
                },
                child: Text(l10n.themeDark),
              ),
            ],
          ),
        );
      },
      trailing: const Icon(Icons.chevron_right),
    );
  }
}
