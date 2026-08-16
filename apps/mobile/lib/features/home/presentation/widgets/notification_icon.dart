import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotificationIcon extends StatelessWidget {
  final int count;

  const NotificationIcon({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Stack(
        children: [
          const Icon(Icons.notifications),
          if (count > 0)
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.error,
                  shape: BoxShape.circle,
                ),
              ),
            ),
        ],
      ),
      onPressed: () => context.push('/notifications'),
    );
  }
}
