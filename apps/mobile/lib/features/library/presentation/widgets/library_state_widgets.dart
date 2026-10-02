import 'package:flutter/material.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';

class LibraryLoadingWidget extends StatelessWidget {
  const LibraryLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const SSPLoadingState();
  }
}

class LibraryErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const LibraryErrorWidget({
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

class LibraryEmptyWidget extends StatelessWidget {
  final String message;
  final IconData icon;

  const LibraryEmptyWidget({
    super.key,
    required this.message,
    this.icon = Icons.inbox,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SSPEmptyState(
        title: 'कोई सामग्री नहीं है',
        message: message,
        icon: icon,
        compact: true,
      ),
    );
  }
}
