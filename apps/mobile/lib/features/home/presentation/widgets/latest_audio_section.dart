import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/design_system/components/ssp_audio_tile.dart';
import '../../../../shared/design_system/components/ssp_section_header.dart';
import '../../../../l10n/gen/app_localizations.dart';
import '../../domain/entities/latest_audio_entity.dart';

class LatestAudioSection extends StatelessWidget {
  final List<LatestAudioEntity> audios;

  const LatestAudioSection({super.key, required this.audios});

  @override
  Widget build(BuildContext context) {
    if (audios.isEmpty) return const SizedBox.shrink();

    final l10n = AppLocalizations.of(context)!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SSPSectionHeader(
          title: l10n.latestAudios,
          actionText: l10n.seeAll,
          onAction: () => context.push('/audio'),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: audios.length,
          itemBuilder: (context, index) {
            final audio = audios[index];
            return SSPAudioTile(
              title: audio.title,
              subtitle: audio.speaker,
              durationText: audio.duration.inMinutes > 0
                  ? '${audio.duration.inMinutes}:${(audio.duration.inSeconds % 60).toString().padLeft(2, '0')}'
                  : null,
              artwork: null,
              onTap: () => context.push('/audio/details/${audio.id}'),
              onPlayPause: () {
                // TODO: Implement play/pause from home
              },
            );
          },
        ),
      ],
    );
  }
}