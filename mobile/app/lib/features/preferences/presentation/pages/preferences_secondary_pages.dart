import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/preferences_providers.dart';
import '../widgets/preference_widgets.dart';

class PreferenceAppearanceSettingsPage extends ConsumerWidget {
  const PreferenceAppearanceSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);
    final pref = state.preferences?.appearance;

    if (pref == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Appearance')),
      body: ListView(
        children: [
          PreferenceSection(
            title: 'Theme',
            children: [
              RadioListTile<String>(
                title: const Text('System Default'),
                value: 'system',
                groupValue: pref.themeMode,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateAppearance(pref.copyWith(themeMode: v)),
              ),
              RadioListTile<String>(
                title: const Text('Light'),
                value: 'light',
                groupValue: pref.themeMode,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateAppearance(pref.copyWith(themeMode: v)),
              ),
              RadioListTile<String>(
                title: const Text('Dark'),
                value: 'dark',
                groupValue: pref.themeMode,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateAppearance(pref.copyWith(themeMode: v)),
              ),
            ],
          ),
          PreferenceSection(
            title: 'Colors',
            children: [
              SwitchPreferenceTile(
                title: 'Dynamic Colors',
                subtitle: 'Use colors from your wallpaper (Android 12+)',
                value: pref.useDynamicColors,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateAppearance(pref.copyWith(useDynamicColors: v)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PreferenceAccessibilitySettingsPage extends ConsumerWidget {
  const PreferenceAccessibilitySettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);
    final pref = state.preferences?.accessibility;

    if (pref == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Accessibility')),
      body: ListView(
        children: [
          PreferenceSection(
            title: 'Display',
            children: [
              SwitchPreferenceTile(
                title: 'High Contrast',
                value: pref.highContrast,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateAccessibility(pref.copyWith(highContrast: v)),
              ),
              SwitchPreferenceTile(
                title: 'Reduced Motion',
                subtitle: 'Minimize animations',
                value: pref.reducedMotion,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateAccessibility(pref.copyWith(reducedMotion: v)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PreferenceNotificationSettingsPage extends ConsumerWidget {
  const PreferenceNotificationSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);
    final pref = state.preferences?.notification;

    if (pref == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: ListView(
        children: [
          PreferenceSection(
            title: 'General',
            children: [
              SwitchPreferenceTile(
                title: 'Enable All Notifications',
                value: pref.enableAll,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateNotification(pref.copyWith(enableAll: v)),
              ),
            ],
          ),
          if (pref.enableAll)
            PreferenceSection(
              title: 'Categories',
              children: [
                SwitchPreferenceTile(
                  title: 'New Satsang Alerts',
                  value: pref.newSatsangAlerts,
                  onChanged: (v) => ref
                      .read(preferencesProvider.notifier)
                      .updateNotification(pref.copyWith(newSatsangAlerts: v)),
                ),
                SwitchPreferenceTile(
                  title: 'Daily Quotes',
                  value: pref.dailyQuotes,
                  onChanged: (v) => ref
                      .read(preferencesProvider.notifier)
                      .updateNotification(pref.copyWith(dailyQuotes: v)),
                ),
                SwitchPreferenceTile(
                  title: 'Event Reminders',
                  value: pref.eventReminders,
                  onChanged: (v) => ref
                      .read(preferencesProvider.notifier)
                      .updateNotification(pref.copyWith(eventReminders: v)),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class PreferencePrivacySettingsPage extends ConsumerWidget {
  const PreferencePrivacySettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);
    final pref = state.preferences?.privacy;

    if (pref == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Privacy')),
      body: ListView(
        children: [
          PreferenceSection(
            title: 'Data Collection',
            children: [
              SwitchPreferenceTile(
                title: 'Analytics',
                subtitle: 'Help improve the app by sharing usage data',
                value: pref.analyticsOptIn,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updatePrivacy(pref.copyWith(analyticsOptIn: v)),
              ),
              SwitchPreferenceTile(
                title: 'Crash Reporting',
                subtitle: 'Automatically send crash reports',
                value: pref.crashReportingOptIn,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updatePrivacy(pref.copyWith(crashReportingOptIn: v)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PreferencePlaybackSettingsPage extends ConsumerWidget {
  const PreferencePlaybackSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);
    final pref = state.preferences?.playback;

    if (pref == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Playback')),
      body: ListView(
        children: [
          PreferenceSection(
            title: 'Audio',
            children: [
              SwitchPreferenceTile(
                title: 'Auto Play',
                value: pref.autoPlay,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updatePlayback(pref.copyWith(autoPlay: v)),
              ),
              SwitchPreferenceTile(
                title: 'Background Audio',
                value: pref.backgroundAudio,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updatePlayback(pref.copyWith(backgroundAudio: v)),
              ),
              SwitchPreferenceTile(
                title: 'Resume from Last Position',
                value: pref.continueFromLastPosition,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updatePlayback(pref.copyWith(continueFromLastPosition: v)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PreferenceReadingSettingsPage extends ConsumerWidget {
  const PreferenceReadingSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);
    final pref = state.preferences?.reading;

    if (pref == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Reading')),
      body: ListView(
        children: [
          PreferenceSection(
            title: 'Display',
            children: [
              SwitchPreferenceTile(
                title: 'Keep Screen On',
                value: pref.keepScreenOn,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateReading(pref.copyWith(keepScreenOn: v)),
              ),
              ListTile(
                title: const Text('Font Size'),
                trailing: Text('${pref.fontSize.toInt()}'),
              ),
              Slider(
                value: pref.fontSize,
                min: 12.0,
                max: 32.0,
                divisions: 10,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateReading(pref.copyWith(fontSize: v)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PreferenceDownloadSettingsPage extends ConsumerWidget {
  const PreferenceDownloadSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);
    final pref = state.preferences?.download;

    if (pref == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Downloads')),
      body: ListView(
        children: [
          PreferenceSection(
            title: 'Network',
            children: [
              SwitchPreferenceTile(
                title: 'Download Over Wi-Fi Only',
                value: pref.downloadOverWifiOnly,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateDownload(pref.copyWith(downloadOverWifiOnly: v)),
              ),
            ],
          ),
          PreferenceSection(
            title: 'Storage',
            children: [
              SwitchPreferenceTile(
                title: 'Auto Delete Completed',
                subtitle: 'Delete content after consuming',
                value: pref.autoDeleteCompleted,
                onChanged: (v) => ref
                    .read(preferencesProvider.notifier)
                    .updateDownload(pref.copyWith(autoDeleteCompleted: v)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
