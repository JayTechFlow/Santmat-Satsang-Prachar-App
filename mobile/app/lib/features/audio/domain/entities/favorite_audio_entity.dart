import 'audio_entity.dart';

class FavoriteAudioEntity {
  final AudioEntity audio;
  final DateTime favoritedAt;

  const FavoriteAudioEntity({
    required this.audio,
    required this.favoritedAt,
  });
}
