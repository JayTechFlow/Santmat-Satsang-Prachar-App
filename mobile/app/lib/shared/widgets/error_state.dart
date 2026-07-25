import 'package:flutter/material.dart';
import '../../core/utils/extensions/context_extension.dart';

class ErrorState extends StatelessWidget {
  final String? message;
  final VoidCallback? onRetry;

  const ErrorState({super.key, this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 48, color: context.colorScheme.error),
          const SizedBox(height: 16),
          Text(
            message ?? context.l10n.errorGeneric,
            style: context.textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            ElevatedButton(onPressed: onRetry, child: Text(context.l10n.retry)),
          ],
        ],
      ),
    );
  }
}
