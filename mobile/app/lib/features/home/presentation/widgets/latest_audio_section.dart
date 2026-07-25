import 'package:flutter/material.dart';
import '../../../../../shared/theme/app_spacing.dart';
import '../../../../../shared/theme/app_radius.dart';
import '../../../../../l10n/gen/app_localizations.dart';
import '../../domain/entities/latest_audio_entity.dart';

class LatestAudioSection extends StatelessWidget {
  final List<LatestAudioEntity> audios;

  const LatestAudioSection({super.key, required this.audios});

  @override
  Widget build(BuildContext context) {
    if (audios.isEmpty) return const SizedBox.shrink();

    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                l10n.latestAudios,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(onPressed: () {}, child: Text(l10n.seeAll)),
            ],
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: audios.length,
          itemBuilder: (context, index) {
            final audio = audios[index];
            return ListTile(
              leading: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiaryContainer,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  Icons.music_note,
                  color: theme.colorScheme.onTertiaryContainer,
                ),
              ),
              title: Text(
                audio.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: Text(audio.speaker),
              trailing: const Icon(Icons.play_circle_outline),
              onTap: () {},
            );
          },
        ),
      ],
    );
  }
}
