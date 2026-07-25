import 'package:flutter/material.dart';
import '../../core/utils/extensions/context_extension.dart';

class EmptyState extends StatelessWidget {
  final String? title;
  final String? message;
  final VoidCallback? onRetry;

  const EmptyState({super.key, this.title, this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox, size: 48, color: context.theme.disabledColor),
          const SizedBox(height: 16),
          Text(
            title ?? context.l10n.emptyStateTitle,
            style: context.textTheme.titleMedium,
          ),
          if (message != null) ...[
            const SizedBox(height: 8),
            Text(
              message!,
              style: context.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            ElevatedButton(onPressed: onRetry, child: Text(context.l10n.retry)),
          ],
        ],
      ),
    );
  }
}
