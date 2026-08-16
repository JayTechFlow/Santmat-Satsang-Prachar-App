import 'package:flutter/material.dart';

class ProfileAvatar extends StatelessWidget {
  final String? imageUrl;
  final String fallbackInitial;
  final VoidCallback? onTap;

  const ProfileAvatar({
    super.key,
    this.imageUrl,
    required this.fallbackInitial,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: CircleAvatar(
        radius: 18,
        backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        child: imageUrl == null
            ? Text(
                fallbackInitial,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                  fontWeight: FontWeight.bold,
                ),
              )
            : null,
      ),
    );
  }
}
