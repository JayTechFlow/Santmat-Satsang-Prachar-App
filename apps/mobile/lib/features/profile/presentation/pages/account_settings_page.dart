import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/profile_providers.dart';
import '../../../../l10n/gen/app_localizations.dart';
import '../widgets/account_info_card.dart';
import '../widgets/delete_account_button.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';

class AccountSettingsPage extends ConsumerWidget {
  const AccountSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final profileState = ref.watch(profileStateProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.accountSettings)),
      body: profileState.when(
        loading: () => const SSPLoadingState(),
        error: (error, _) => SSPErrorState(message: error.toString()),
        data: (profile) {
          return ListView(
            children: [
              AccountInfoCard(accountInfo: profile.accountInfo),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.privacy_tip_outlined),
                title: Text(l10n.privacyPolicy),
                trailing: const Icon(Icons.open_in_new),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.description_outlined),
                title: Text(l10n.termsConditions),
                trailing: const Icon(Icons.open_in_new),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.info_outline),
                title: Text(l10n.aboutApp),
                trailing: const Icon(Icons.open_in_new),
                onTap: () {},
              ),
              const Divider(),
              DeleteAccountButton(
                onDelete: () {
                  // Handle account deletion
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
