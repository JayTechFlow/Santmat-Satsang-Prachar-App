import 'package:flutter/material.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';

class NotificationsLoadingWidget extends StatelessWidget {
  const NotificationsLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const SSPLoadingState();
  }
}

class NotificationsErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const NotificationsErrorWidget({
    super.key,
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SSPErrorState(
        message: message,
        onRetry: onRetry,
        retryLabel: 'Retry',
      ),
    );
  }
}

class NotificationsEmptyWidget extends StatelessWidget {
  const NotificationsEmptyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SSPEmptyState(
        title: 'कोई नई सूचना नहीं',
        message: 'No notifications yet',
        icon: SSPIcons.notificationsNav,
      ),
    );
  }
}
