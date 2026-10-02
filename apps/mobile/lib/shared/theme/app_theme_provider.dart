import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/preferences/presentation/providers/preferences_providers.dart';
import '../../features/preferences/presentation/providers/preferences_state.dart';

class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    ref.listen<PreferencesState>(preferencesProvider, (prev, next) {
      final modeStr = next.preferences?.appearance.themeMode;
      if (modeStr != null) {
        final targetMode = _parseThemeMode(modeStr);
        if (state != targetMode) {
          state = targetMode;
        }
      }
    });

    final initialModeStr =
        ref.read(preferencesProvider).preferences?.appearance.themeMode;
    return _parseThemeMode(initialModeStr ?? 'light');
  }

  static ThemeMode _parseThemeMode(String modeStr) {
    switch (modeStr.toLowerCase()) {
      case 'dark':
        return ThemeMode.dark;
      case 'light':
        return ThemeMode.light;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  void toggle() {
    final nextMode = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    setThemeMode(nextMode);
  }

  void setThemeMode(ThemeMode mode) {
    state = mode;
    final modeStr = mode == ThemeMode.dark
        ? 'dark'
        : (mode == ThemeMode.light ? 'light' : 'system');
    try {
      final prefsNotifier = ref.read(preferencesProvider.notifier);
      final currentApp = ref.read(preferencesProvider).preferences?.appearance;
      if (currentApp != null) {
        prefsNotifier.updateAppearance(currentApp.copyWith(themeMode: modeStr));
      }
    } catch (_) {}
  }
}

/// App theme mode provider allowing dynamic Light/Dark mode toggling.
final themeModeProvider =
    NotifierProvider<ThemeModeNotifier, ThemeMode>(ThemeModeNotifier.new);

/// Helper function to toggle theme mode between Light and Dark.
void toggleThemeMode(WidgetRef ref) {
  ref.read(themeModeProvider.notifier).toggle();
}
