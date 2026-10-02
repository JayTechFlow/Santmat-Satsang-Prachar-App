import 'package:flutter/material.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';

class DonationsLoadingWidget extends StatelessWidget {
  const DonationsLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const SSPLoadingState();
  }
}

class DonationsErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const DonationsErrorWidget({
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

class DonationsEmptyWidget extends StatelessWidget {
  const DonationsEmptyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SSPEmptyState(
        title: 'कोई दान अभियान नहीं',
        message: 'No campaigns right now',
        icon: Icons.volunteer_activism_rounded,
      ),
    );
  }
}
