import 'package:flutter/material.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';

class EventsLoadingWidget extends StatelessWidget {
  const EventsLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const SSPLoadingState();
  }
}

class EventsErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const EventsErrorWidget({
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
