import 'package:flutter/material.dart';

class SatsangEmptyStateWidget extends StatelessWidget {
  final String message;

  const SatsangEmptyStateWidget({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(message, style: Theme.of(context).textTheme.bodyLarge),
    );
  }
}
