import 'package:flutter/material.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';

class BooksLoadingWidget extends StatelessWidget {
  const BooksLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const SSPLoadingState();
  }
}

class BooksErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const BooksErrorWidget({
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
