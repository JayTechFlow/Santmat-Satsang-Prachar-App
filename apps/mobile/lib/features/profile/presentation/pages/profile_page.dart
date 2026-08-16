import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/profile_providers.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_avatar_card.dart';
import '../widgets/statistics_card.dart';
import '../widgets/logout_button.dart';
import '../../../../l10n/gen/app_localizations.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_section_header.dart';
import '../../../../shared/design_system/components/ssp_list_item.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileStateProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      body: SafeArea(
        child: profileState.when(
          loading: () => const SSPLoadingState(),
          error: (error, stack) => SSPErrorState(
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
                    phone: profile.phone,
                    photoUrl: profile.photoUrl,
                    onEdit: () => context.push('/profile/edit'),
                  ),
                ),
                SliverToBoxAdapter(
                  child: StatisticsCard(statistics: profile.statistics),
                ),
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      SSPSectionHeader(
                        title: l10n.preferences,
                        padding: SSPSpacing.pMd,
                      ),
                      SSPListItem(
                        leading: Icon(
                          SSPIcons.settingsNav,
                          color: SSPColors.textPrimary(context),
                        ),
                        title: l10n.language,
                        subtitle: profile.preferences.languageCode == 'en'
                            ? 'English'
                            : 'हिंदी',
                        trailing: Icon(
                          SSPIcons.chevronRight,
                          color: SSPColors.textTertiary(context),
                        ),
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (context) => SimpleDialog(
                              title: Text(l10n.language),
                              children: [
                                SimpleDialogOption(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    ref
                                        .read(profileStateProvider.notifier)
                                        .updatePreferences(
                                          profile.preferences.copyWith(
                                            languageCode: 'en',
                                          ),
                                        );
                                  },
                                  child: const Text('English'),
                                ),
                                SimpleDialogOption(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    ref
                                        .read(profileStateProvider.notifier)
                                        .updatePreferences(
                                          profile.preferences.copyWith(
                                            languageCode: 'hi',
                                          ),
                                        );
                                  },
                                  child: const Text('हिंदी'),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      SSPListItem(
                        leading: Icon(
                          SSPIcons.settingsNav,
                          color: SSPColors.textPrimary(context),
                        ),
                        title: l10n.theme,
                        subtitle: _getThemeName(
                          context,
                          profile.preferences.themeMode,
                          l10n,
                        ),
                        trailing: Icon(
                          SSPIcons.chevronRight,
                          color: SSPColors.textTertiary(context),
                        ),
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (context) => SimpleDialog(
                              title: Text(l10n.theme),
                              children: [
                                SimpleDialogOption(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    ref
                                        .read(profileStateProvider.notifier)
                                        .updatePreferences(
                                          profile.preferences.copyWith(
                                            themeMode: 'system',
                                          ),
                                        );
                                  },
                                  child: Text(l10n.themeSystem),
                                ),
                                SimpleDialogOption(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    ref
                                        .read(profileStateProvider.notifier)
                                        .updatePreferences(
                                          profile.preferences.copyWith(
                                            themeMode: 'light',
                                          ),
                                        );
                                  },
                                  child: Text(l10n.themeLight),
                                ),
                                SimpleDialogOption(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    ref
                                        .read(profileStateProvider.notifier)
                                        .updatePreferences(
                                          profile.preferences.copyWith(
                                            themeMode: 'dark',
                                          ),
                                        );
                                  },
                                  child: Text(l10n.themeDark),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      SSPListItem(
                        leading: Icon(
                          SSPIcons.notificationsNav,
                          color: SSPColors.textPrimary(context),
                        ),
                        title: l10n.notifications,
                        trailing: Switch(
                          value: profile.preferences.notificationsEnabled,
                          onChanged: (val) {
                            ref
                                .read(profileStateProvider.notifier)
                                .updatePreferences(
                                  profile.preferences.copyWith(
                                    notificationsEnabled: val,
                                  ),
                                );
                          },
                        ),
                        onTap: null,
                      ),
                    ],
                  ),
                ),
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      SSPSectionHeader(
                        title: l10n.accountSettings,
                        padding: SSPSpacing.pMd,
                      ),
                      SSPListItem(
                        leading: Icon(
                          SSPIcons.profileNav,
                          color: SSPColors.textPrimary(context),
                        ),
                        title: l10n.accountSettings,
                        trailing: Icon(
                          SSPIcons.chevronRight,
                          color: SSPColors.textTertiary(context),
                        ),
                        onTap: () => context.push('/profile/account'),
                      ),
                      SSPListItem(
                        leading: Icon(
                          SSPIcons.favorite,
                          color: SSPColors.textPrimary(context),
                        ),
                        title: 'Favorite Bhajans',
                        trailing: Icon(
                          SSPIcons.chevronRight,
                          color: SSPColors.textTertiary(context),
                        ),
                        onTap: () => context.push('/profile/favorites'),
                      ),
                      SSPListItem(
                        leading: Icon(
                          SSPIcons.audioNav,
                          color: SSPColors.textPrimary(context),
                        ),
                        title: 'Listening History',
                        trailing: Icon(
                          SSPIcons.chevronRight,
                          color: SSPColors.textTertiary(context),
                        ),
                        onTap: () => context.push('/profile/history'),
                      ),
                      SSPListItem(
                        leading: Icon(
                          SSPIcons.info,
                          color: SSPColors.textPrimary(context),
                        ),
                        title: l10n.aboutApp,
                        trailing: Icon(
                          SSPIcons.arrowForward,
                          color: SSPColors.textTertiary(context),
                        ),
                        onTap: () {},
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

  String _getThemeName(
    BuildContext context,
    String themeMode,
    AppLocalizations l10n,
  ) {
    switch (themeMode) {
      case 'light':
        return l10n.themeLight;
      case 'dark':
        return l10n.themeDark;
      default:
        return l10n.themeSystem;
    }
  }
}
