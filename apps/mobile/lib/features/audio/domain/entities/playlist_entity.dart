import 'audio_entity.dart';

class PlaylistEntity {
  final String id;
  final String title;
  final String description;
  final String coverImageUrl;
  final List<AudioEntity> audios;
  final int totalAudios;

  const PlaylistEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.coverImageUrl,
    required this.audios,
    required this.totalAudios,
  });
}
