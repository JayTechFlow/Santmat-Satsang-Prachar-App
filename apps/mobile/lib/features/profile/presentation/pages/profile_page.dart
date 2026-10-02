import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/profile_providers.dart';
import 'package:share_plus/share_plus.dart';
import '../widgets/profile_header_card.dart';
import '../widgets/profile_section.dart';
import '../widgets/profile_font_scale_tile.dart';
import '../../../../shared/theme/app_theme_provider.dart';
import '../../../../core/localization/locale_provider.dart';
import '../../domain/entities/user_profile_entity.dart';
import '../../../../shared/design_system/components/ssp_confirmation_dialog.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_list_item.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';
import '../../../../l10n/gen/app_localizations.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileStateProvider);
    final themeMode = ref.watch(themeModeProvider);
    final l10n = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? SSPColors.darkBackground : SSPColors.lightBackground,
      appBar: SSPAppBar.standard(
        title: l10n?.profile ?? 'मेरी प्रोफ़ाइल',
        subtitle: '॥ सत्य ही हमारा धर्म है ॥',
      ),
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
              physics: const BouncingScrollPhysics(),
              slivers: [
                // 1. Profile Header Hero Card
                SliverToBoxAdapter(
                  child: ProfileHeaderCard(
                    profile: profile,
                    onEditProfile: () => context.push('/profile/edit'),
                  ),
                ),

                const SliverToBoxAdapter(
                  child: SizedBox(height: SSPSpacing.md),
                ),

                // 2. Settings Card Sections
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: SSPSpacing.md,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Card Section 1: खाता एवं सुरक्षा (Account & Security)
                        ProfileSection(
                          title: 'खाता एवं सुरक्षा (Account)',
                          icon: SSPIcons.profileNav,
                          children: [
                            SSPListItem(
                              leading: Icon(
                                Icons.person_outline,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'व्यक्तिगत जानकारी (Profile Details)',
                              subtitle: 'नाम, फोन और ईमेल विवरण अपडेट करें',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () => context.push('/profile/edit'),
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.security_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'खाता सेटिंग्स (Account Settings)',
                              subtitle: 'सदस्यता विवरण एवं खाता प्रबंधन',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () => context.push('/profile/account'),
                            ),
                          ],
                        ),

                        const SizedBox(height: SSPSpacing.md),

                        // Card Section 2: गतिविधि एवं सहेजे गए (Activity & Saved)
                        ProfileSection(
                          title: 'गतिविधि एवं सहेजे गए (Activity)',
                          icon: Icons.bookmark_border_rounded,
                          children: [
                            SSPListItem(
                              leading: const Icon(
                                Icons.favorite_outline_rounded,
                                color: Colors.redAccent,
                              ),
                              title: 'पसंदीदा भजन एवं ग्रंथ (Favorites)',
                              subtitle: 'आपके सहेजे गए पसंदीदा भजन एवं पुस्तक',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () => context.push('/profile/favorites'),
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.history_rounded,
                                color: isDark
                                    ? SSPColors.darkPrimary
                                    : SSPColors.lightPrimary,
                              ),
                              title: 'सुनने का इतिहास (Listening History)',
                              subtitle: 'हाल ही में सुने गए भजन एवं प्रवचन',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () => context.push('/profile/history'),
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.format_quote_rounded,
                                color: isDark
                                    ? SSPColors.darkPrimary
                                    : SSPColors.lightPrimary,
                              ),
                              title: 'आज का सुविचार (Daily Quote)',
                              subtitle: 'दैनिक प्रेरणादायक संत विचार',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () => context.push('/quotes'),
                            ),
                          ],
                        ),

                        const SizedBox(height: SSPSpacing.md),

                        // Card Section 2: ऐप प्राथमिकताएं (Preferences)
                        ProfileSection(
                          title: 'ऐप प्राथमिकताएं (Preferences)',
                          icon: SSPIcons.settingsNav,
                          children: [
                            // Dark Mode switch synced with canonical themeModeProvider
                            SSPListItem(
                              leading: Icon(
                                themeMode == ThemeMode.dark ||
                                        (themeMode == ThemeMode.system && isDark)
                                    ? Icons.dark_mode_outlined
                                    : Icons.light_mode_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'डार्क मोड (Dark Mode)',
                              subtitle: themeMode == ThemeMode.dark
                                  ? 'डार्क थीम चालू'
                                  : (themeMode == ThemeMode.light
                                      ? 'लाइट थीम चालू'
                                      : 'सिस्टम थीम चालू'),
                              trailing: Switch(
                                value: themeMode == ThemeMode.dark ||
                                    (themeMode == ThemeMode.system && isDark),
                                activeTrackColor: isDark
                                    ? SSPColors.darkPrimary
                                    : SSPColors.lightPrimary,
                                onChanged: (val) {
                                  final newThemeMode =
                                      val ? ThemeMode.dark : ThemeMode.light;
                                  final newModeStr = val ? 'dark' : 'light';
                                  ref
                                      .read(themeModeProvider.notifier)
                                      .setThemeMode(newThemeMode);
                                  ref
                                      .read(profileStateProvider.notifier)
                                      .updatePreferences(
                                        profile.preferences.copyWith(
                                          themeMode: newModeStr,
                                        ),
                                      );
                                },
                              ),
                            ),

                            // Language selector (हिंदी/English)
                            SSPListItem(
                              leading: Icon(
                                Icons.language_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: l10n?.language ?? 'भाषा (Language)',
                              subtitle:
                                  profile.preferences.languageCode == 'en'
                                      ? 'English'
                                      : 'हिंदी (Hindi)',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () {
                                _showLanguageDialog(context, ref, profile);
                              },
                            ),

                            // Devanagari Font Scale slider
                            const ProfileFontScaleTile(),
                          ],
                        ),

                        const SizedBox(height: SSPSpacing.md),

                        // Card Section 3: मीडिया एवं डाउनलोड (Media & Downloads)
                        ProfileSection(
                          title: 'मीडिया एवं डाउनलोड (Media & Downloads)',
                          icon: SSPIcons.audioNav,
                          children: [
                            SSPListItem(
                              leading: Icon(
                                Icons.high_quality_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'ऑडियो गुणवत्ता (Audio Quality)',
                              subtitle: _getAudioQualityLabel(
                                profile.preferences.audioQuality,
                              ),
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () {
                                _showAudioQualityDialog(context, ref, profile);
                              },
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.folder_zip_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'ऑफ़लाइन स्टोरेज (Offline Storage)',
                              subtitle:
                                  '${profile.statistics.downloadCount * 14} MB प्रयुक्त • कैश साफ़ करें',
                              trailing: TextButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'ऑफ़लाइन कैशे साफ़ किया गया (Cache Cleared)',
                                      ),
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                },
                                child: const Text('साफ़ करें'),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: SSPSpacing.md),

                        // Card Section 5: सहायता एवं जानकारी (Support & About)
                        ProfileSection(
                          title: 'सहायता एवं जानकारी (Support & About)',
                          icon: SSPIcons.info,
                          children: [
                            SSPListItem(
                              leading: Icon(
                                Icons.share_rounded,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'ऐप शेयर करें (Share App)',
                              subtitle:
                                  'मित्रों एवं परिवार के साथ संतमत ऐप साझा करें',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () {
                                SharePlus.instance.share(
                                  ShareParams(
                                    text:
                                        'संतमत सत्संग प्रचार ऐप से जुड़ें। https://santmatsatsang.org',
                                  ),
                                );
                              },
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.contact_support_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'आश्रम से संपर्क करें (Contact Ashram)',
                              subtitle: 'सत्संग केंद्र एवं सहायता पूछताछ',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () {
                                _showContactAshramDialog(context);
                              },
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.privacy_tip_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'गोपनीयता नीति (Privacy Policy)',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () {
                                _showInfoModal(
                                  context,
                                  title: 'गोपनीयता नीति (Privacy Policy)',
                                  content:
                                      'संतमत सत्संग प्रचार ऐप आपकी निजता का पूर्ण सम्मान करता है। आपका डेटा सुरक्षित और गोपनीय रखा जाता है।',
                                );
                              },
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.description_outlined,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'नियम एवं शर्तें (Terms & Conditions)',
                              trailing: Icon(
                                SSPIcons.chevronRight,
                                color: SSPColors.textTertiary(context),
                              ),
                              onTap: () {
                                _showInfoModal(
                                  context,
                                  title: 'नियम एवं शर्तें (Terms & Conditions)',
                                  content:
                                      'संतमत सत्संग प्रचार ऐप के माध्यम से अध्यात्म, स्तुति, और सत्संग विचारों का प्रसार किया जाता है।',
                                );
                              },
                            ),
                            SSPListItem(
                              leading: Icon(
                                Icons.info_outline,
                                color: SSPColors.textPrimary(context),
                              ),
                              title: 'ऐप संस्करण (App Version)',
                              subtitle:
                                  'v${profile.accountInfo.applicationVersion} • संतमत सत्संग',
                            ),
                          ],
                        ),

                        const SizedBox(height: SSPSpacing.xl),

                        // Logout action button with SSPConfirmationDialog
                        Padding(
                          padding: const EdgeInsets.only(
                            bottom: SSPSpacing.xl,
                          ),
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              final confirmed =
                                  await SSPConfirmationDialog.show(
                                context,
                                title: 'लॉगआउट (Logout)',
                                message:
                                    'क्या आप निश्चित रूप से अपने खाते से लॉगआउट करना चाहते हैं?',
                                confirmLabel: 'लॉगआउट (Logout)',
                                cancelLabel: 'रद्द करें (Cancel)',
                                isDestructive: true,
                              );

                              if (confirmed == true) {
                                await ref
                                    .read(profileStateProvider.notifier)
                                    .logout();
                                if (context.mounted) {
                                  context.go('/login');
                                }
                              }
                            },
                            icon: const Icon(
                              Icons.logout,
                              color: SSPColors.error,
                            ),
                            label: Text(
                              'लॉगआउट करें (Logout)',
                              style: SSPTypography.labelLarge.copyWith(
                                color: SSPColors.error,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: SSPColors.error),
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(
                                borderRadius: SSPRadius.brPill,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  static String _getAudioQualityLabel(String quality) {
    switch (quality) {
      case 'high':
        return 'उच्च (High - 320 kbps)';
      case 'low':
        return 'कम (Low - 64 kbps)';
      case 'standard':
      default:
        return 'मानक (Standard - 128 kbps)';
    }
  }

  static void _showLanguageDialog(
    BuildContext context,
    WidgetRef ref,
    UserProfileEntity profile,
  ) {
    showDialog(
      context: context,
      builder: (dialogContext) => SimpleDialog(
        title: const Text('भाषा चुनें (Select Language)'),
        children: [
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(dialogContext);
              ref.read(localeProvider.notifier).setLocale(const Locale('hi'));
              ref.read(profileStateProvider.notifier).updatePreferences(
                    profile.preferences.copyWith(languageCode: 'hi'),
                  );
            },
            child: Row(
              children: [
                const Icon(Icons.check, color: Colors.orange, size: 20),
                const SizedBox(width: 8),
                Text(
                  'हिंदी (Hindi)',
                  style: TextStyle(
                    fontWeight: profile.preferences.languageCode == 'hi'
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(dialogContext);
              ref.read(localeProvider.notifier).setLocale(const Locale('en'));
              ref.read(profileStateProvider.notifier).updatePreferences(
                    profile.preferences.copyWith(languageCode: 'en'),
                  );
            },
            child: Row(
              children: [
                if (profile.preferences.languageCode == 'en')
                  const Icon(Icons.check, color: Colors.orange, size: 20)
                else
                  const SizedBox(width: 28),
                Text(
                  'English',
                  style: TextStyle(
                    fontWeight: profile.preferences.languageCode == 'en'
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static void _showAudioQualityDialog(
    BuildContext context,
    WidgetRef ref,
    UserProfileEntity profile,
  ) {
    showDialog(
      context: context,
      builder: (dialogContext) => SimpleDialog(
        title: const Text('ऑडियो गुणवत्ता (Audio Quality)'),
        children: [
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(dialogContext);
              ref.read(profileStateProvider.notifier).updatePreferences(
                    profile.preferences.copyWith(audioQuality: 'high'),
                  );
            },
            child: const Text('उच्च (High Quality - 320 kbps)'),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(dialogContext);
              ref.read(profileStateProvider.notifier).updatePreferences(
                    profile.preferences.copyWith(audioQuality: 'standard'),
                  );
            },
            child: const Text('मानक (Standard Quality - 128 kbps)'),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(dialogContext);
              ref.read(profileStateProvider.notifier).updatePreferences(
                    profile.preferences.copyWith(audioQuality: 'low'),
                  );
            },
            child: const Text('कम डेटा (Data Saver - 64 kbps)'),
          ),
        ],
      ),
    );
  }

  static void _showContactAshramDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('आश्रम से संपर्क करें (Contact Ashram)'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('महर्षि मेँहीं आश्रम, कुप्पाघाट, भागलपुर'),
            SizedBox(height: 8),
            Text('📞 फोन: +91 94312 00000'),
            SizedBox(height: 4),
            Text('✉️ ईमेल: contact@santmatsatsang.org'),
            SizedBox(height: 4),
            Text('🌐 वेबसाइट: www.santmatsatsang.org'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ठीक है'),
          ),
        ],
      ),
    );
  }

  static void _showInfoModal(
    BuildContext context, {
    required String title,
    required String content,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ठीक है'),
          ),
        ],
      ),
    );
  }
}
