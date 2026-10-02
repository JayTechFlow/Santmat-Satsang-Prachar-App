import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/utils/phone_number_utils.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../providers/profile_providers.dart';
import '../../../../shared/design_system/components/ssp_confirmation_dialog.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';

class AccountSettingsPage extends ConsumerStatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  ConsumerState<AccountSettingsPage> createState() =>
      _AccountSettingsPageState();
}

class _AccountSettingsPageState extends ConsumerState<AccountSettingsPage> {
  Future<void> _handleDeleteAccount() async {
    final confirmed = await SSPConfirmationDialog.show(
      context,
      title: 'खाता हटाएं (Delete Account)',
      message:
          'क्या आप निश्चित रूप से अपना खाता हटाना चाहते हैं? यह प्रक्रिया अपरिवर्तनीय है और आपका सारा डेटा हटा दिया जाएगा।',
      confirmLabel: 'खाता हटाएं (Delete)',
      cancelLabel: 'रद्द करें (Cancel)',
      isDestructive: true,
    );

    if (confirmed == true && mounted) {
      try {
        final authUser = FirebaseAuth.instance.currentUser;
        if (authUser != null) {
          await authUser.delete();
        }
        if (!mounted) return;
        ref.read(profileStateProvider.notifier).logout();
        context.go('/login');
      } on FirebaseAuthException catch (e) {
        if (!mounted) return;
        if (e.code == 'requires-recent-login') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'सुरक्षा कारणों से, कृपया पुनः लॉगिन करें और फिर खाता हटाएं। (For security, please log in again to delete your account.)',
              ),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('खाता हटाने में विफल: ${e.message ?? e.code}'),
            ),
          );
        }
      } catch (e) {
        if (!mounted) return;
        ref.read(profileStateProvider.notifier).logout();
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileStateProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? SSPColors.darkBackground
          : SSPColors.lightBackground,
      appBar: const SSPAppBar.standard(
        title: 'खाता एवं सुरक्षा',
        subtitle: 'अकाउंट एवं सुरक्षा सेटिंग्स',
      ),
      body: profileState.when(
        loading: () => const SSPLoadingState(),
        error: (error, _) => SSPErrorState(message: error.toString()),
        data: (profile) {
          final formattedMemberDate =
              "${profile.accountInfo.memberSince.day}/${profile.accountInfo.memberSince.month}/${profile.accountInfo.memberSince.year}";

          return SingleChildScrollView(
            padding: const EdgeInsets.all(SSPSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Account Overview Card
                Card(
                  elevation: 0,
                  color: isDark
                      ? SSPColors.darkSurface
                      : SSPColors.lightSurface,
                  shape: RoundedRectangleBorder(
                    borderRadius: SSPRadius.brMedium,
                    side: BorderSide(
                      color: isDark
                          ? SSPColors.darkOutline
                          : SSPColors.lightOutline,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(SSPSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(SSPSpacing.xs),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? SSPColors.darkPrimary.withValues(
                                        alpha: 0.15,
                                      )
                                    : SSPColors.lightPrimary.withValues(
                                        alpha: 0.15,
                                      ),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                SSPIcons.profileNav,
                                color: isDark
                                    ? SSPColors.darkPrimary
                                    : SSPColors.lightPrimary,
                              ),
                            ),
                            const SizedBox(width: SSPSpacing.sm),
                            Text(
                              'खाता विवरण (Account Details)',
                              style: SSPTypography.titleMedium.copyWith(
                                color: SSPColors.textPrimary(context),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: SSPSpacing.md),
                        _InfoRow(
                          label: 'नाम (Name)',
                          value: profile.name,
                          context: context,
                        ),
                        if (profile.email != null && profile.email!.isNotEmpty)
                          _InfoRow(
                            label: 'ईमेल (Email)',
                            value: profile.email!,
                            context: context,
                          ),
                        if (profile.phone != null && profile.phone!.isNotEmpty)
                          _InfoRow(
                            label: 'फोन (Phone)',
                            value: PhoneNumberUtils.formatDisplay(
                              profile.phone!,
                            ),
                            context: context,
                          ),
                        _InfoRow(
                          label: 'सदस्यता तिथि (Member Since)',
                          value: formattedMemberDate,
                          context: context,
                        ),
                        _InfoRow(
                          label: 'भूमिका (Role)',
                          value: 'सत्संग सदस्य (Satsang Member)',
                          context: context,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: SSPSpacing.lg),

                // Danger Zone: Delete Account
                Card(
                  elevation: 0,
                  color: SSPColors.error.withValues(alpha: 0.05),
                  shape: RoundedRectangleBorder(
                    borderRadius: SSPRadius.brMedium,
                    side: BorderSide(
                      color: SSPColors.error.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(SSPSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'अंतिम क्षेत्र (Danger Zone)',
                          style: SSPTypography.titleMedium.copyWith(
                            color: SSPColors.error,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: SSPSpacing.xs),
                        Text(
                          'खाता हटाने पर आपका सारा डेटा और सेटिंग्स स्थायी रूप से हटा दिए जाएंगे।',
                          style: SSPTypography.bodySmall.copyWith(
                            color: SSPColors.textSecondary(context),
                          ),
                        ),
                        const SizedBox(height: SSPSpacing.md),
                        OutlinedButton.icon(
                          onPressed: _handleDeleteAccount,
                          icon: const Icon(
                            Icons.delete_forever,
                            color: SSPColors.error,
                          ),
                          label: Text(
                            'खाता हटाएं (Delete Account)',
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
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final BuildContext context;

  const _InfoRow({
    required this.label,
    required this.value,
    required this.context,
  });

  @override
  Widget build(BuildContext buildContext) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: SSPSpacing.xs),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: SSPTypography.bodyMedium.copyWith(
              color: SSPColors.textSecondary(context),
            ),
          ),
          Text(
            value,
            style: SSPTypography.bodyMedium.copyWith(
              color: SSPColors.textPrimary(context),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
