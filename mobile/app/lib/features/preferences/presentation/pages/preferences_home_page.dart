import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/preferences_providers.dart';
import '../../../../shared/theme/app_spacing.dart';

class PreferencesHomePage extends ConsumerWidget {
  const PreferencesHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(preferencesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
          ? Center(child: Text('Error: ${state.error}'))
          : ListView(
              children: [
                ListTile(
                  leading: const Icon(Icons.palette),
                  title: const Text('Appearance'),
                  subtitle: const Text('Theme, colors, and dynamic scheme'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings/appearance'),
                ),
                ListTile(
                  leading: const Icon(Icons.language),
                  title: const Text('Language'),
                  subtitle: const Text('App language and translation'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.accessibility),
                  title: const Text('Accessibility'),
                  subtitle: const Text('Text size, contrast, and motion'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings/accessibility'),
                ),
                ListTile(
                  leading: const Icon(Icons.notifications),
                  title: const Text('Notifications'),
                  subtitle: const Text('Alerts, reminders, and updates'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings/notifications'),
                ),
                ListTile(
                  leading: const Icon(Icons.security),
                  title: const Text('Privacy'),
                  subtitle: const Text('Analytics, ads, and crash reports'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings/privacy'),
                ),
                ListTile(
                  leading: const Icon(Icons.play_circle_outline),
                  title: const Text('Playback'),
                  subtitle: const Text('Audio and video settings'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings/playback'),
                ),
                ListTile(
                  leading: const Icon(Icons.menu_book),
                  title: const Text('Reading'),
                  subtitle: const Text('Fonts, line height, and display'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings/reading'),
                ),
                ListTile(
                  leading: const Icon(Icons.download),
                  title: const Text('Downloads'),
                  subtitle: const Text('Quality, network, and storage'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings/downloads'),
                ),
                const Divider(),
                Padding(
                  padding: AppSpacing.p16,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.restore),
                    label: const Text('Reset All Settings'),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Reset Settings'),
                          content: const Text(
                            'Are you sure you want to reset all settings to their default values?',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: const Text('Cancel'),
                            ),
                            FilledButton(
                              onPressed: () {
                                ref
                                    .read(preferencesProvider.notifier)
                                    .resetAll();
                                Navigator.pop(context);
                              },
                              child: const Text('Reset'),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
