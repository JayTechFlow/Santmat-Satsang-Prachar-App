import 'package:flutter/material.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import 'audio_card.dart';

class RecentlyPlayedSection extends StatelessWidget {
  final String title;
  final List<RecentlyPlayedEntity> recentlyPlayed;
  final Function(RecentlyPlayedEntity) onTap;

  const RecentlyPlayedSection({
    super.key,
    required this.title,
    required this.recentlyPlayed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (recentlyPlayed.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          child: Text(title, style: Theme.of(context).textTheme.titleLarge),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: recentlyPlayed.length,
          itemBuilder: (context, index) {
            return AudioCard(
              audio: recentlyPlayed[index].audio,
              onTap: () => onTap(recentlyPlayed[index]),
            );
          },
        ),
      ],
    );
  }
}
