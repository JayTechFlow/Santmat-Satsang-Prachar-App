import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/profile_providers.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_avatar_card.dart';
import '../widgets/statistics_card.dart';
import '../widgets/settings_section.dart';
import '../widgets/language_selector_tile.dart';
import '../widgets/theme_selector_tile.dart';
import '../widgets/notification_preference_tile.dart';
import '../widgets/logout_button.dart';
import '../widgets/loading_state_widget.dart';
import '../widgets/error_state_widget.dart';
import '../../../../l10n/gen/app_localizations.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileStateProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      body: SafeArea(
        child: profileState.when(
          loading: () => const LoadingStateWidget(),
          error: (error, stack) => ErrorStateWidget(
            message: error.toString(),
            onRetry: () =>
                ref.read(profileStateProvider.notifier).loadProfile(),
          ),
          data: (profile) {
            return CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: ProfileHeader(title: l10n.profile)),
                SliverToBoxAdapter(
                  child: ProfileAvatarCard(
                    name: profile.name,
                    email: profile.email,
                    photoUrl: profile.photoUrl,
                    onEdit: () => context.push('/profile/edit'),
                  ),
                ),
                SliverToBoxAdapter(
                  child: StatisticsCard(statistics: profile.statistics),
                ),
                SliverToBoxAdapter(
                  child: SettingsSection(
                    title: l10n.preferences,
                    children: [
                      LanguageSelectorTile(
                        currentLanguage: profile.preferences.languageCode,
                        onLanguageChanged: (val) {
                          // TODO in next module: Handle language change correctly
                        },
                      ),
                      ThemeSelectorTile(
                        currentTheme: profile.preferences.themeMode,
                        onThemeChanged: (val) {
                          // Handle theme change
                        },
                      ),
                      NotificationPreferenceTile(
                        isEnabled: profile.preferences.notificationsEnabled,
                        onToggled: (val) {
                          ref
                              .read(profileStateProvider.notifier)
                              .updatePreferences(
                                profile.preferences.copyWith(
                                  notificationsEnabled: val,
                                ),
                              );
                        },
                      ),
                    ],
                  ),
                ),
                SliverToBoxAdapter(
                  child: SettingsSection(
                    title: l10n.accountSettings,
                    children: [
                      ListTile(
                        leading: const Icon(Icons.person_outline),
                        title: Text(l10n.accountSettings),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/profile/account'),
                      ),
                    ],
                  ),
                ),
                SliverToBoxAdapter(
                  child: LogoutButton(
                    onLogout: () {
                      ref.read(profileStateProvider.notifier).logout();
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
