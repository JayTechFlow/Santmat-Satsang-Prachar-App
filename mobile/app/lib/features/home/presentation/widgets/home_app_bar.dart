import 'package:flutter/material.dart';
import '../../../../../l10n/gen/app_localizations.dart';
import 'notification_icon.dart';
import 'profile_avatar.dart';

class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final int notificationCount;
  final String profileInitial;

  const HomeAppBar({
    super.key,
    required this.notificationCount,
    required this.profileInitial,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(AppLocalizations.of(context)!.appTitle),
      actions: [
        NotificationIcon(count: notificationCount),
        const SizedBox(width: 8),
        ProfileAvatar(
          fallbackInitial: profileInitial,
          onTap: () {
            // Navigate to profile
          },
        ),
        const SizedBox(width: 16),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
