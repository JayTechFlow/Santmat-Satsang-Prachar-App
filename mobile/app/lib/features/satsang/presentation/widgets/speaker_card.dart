import 'package:flutter/material.dart';
import '../../domain/entities/speaker_entity.dart';
import '../../../../shared/theme/app_spacing.dart';

class SpeakerCard extends StatelessWidget {
  final SpeakerEntity speaker;
  final VoidCallback onTap;

  const SpeakerCard({super.key, required this.speaker, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
        child: Column(
          children: [
            CircleAvatar(
              radius: 32,
              backgroundImage: speaker.photoUrl != null
                  ? NetworkImage(speaker.photoUrl!)
                  : null,
              child: speaker.photoUrl == null
                  ? const Icon(Icons.person, size: 32)
                  : null,
            ),
            const SizedBox(height: AppSpacing.xs),
            SizedBox(
              width: 80,
              child: Text(
                speaker.name,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
