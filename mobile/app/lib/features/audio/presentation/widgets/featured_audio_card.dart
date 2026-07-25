import 'package:flutter/material.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';
import '../../domain/entities/audio_entity.dart';

class FeaturedAudioCard extends StatelessWidget {
  final AudioEntity audio;
  final VoidCallback onTap;

  const FeaturedAudioCard({
    super.key,
    required this.audio,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      margin: const EdgeInsets.only(right: AppSpacing.md, left: AppSpacing.md),
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Image.network(
                  audio.artworkUrl,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const ColoredBox(
                    color: Colors.grey,
                    child: Center(child: Icon(Icons.music_note, size: 50)),
                  ),
                ),
              ),
              Padding(
                padding: AppSpacing.paddingAllMd,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      audio.title,
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      audio.speaker,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
