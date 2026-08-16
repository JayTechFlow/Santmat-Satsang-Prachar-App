import 'audio_entity.dart';

class RecentlyPlayedEntity {
  final AudioEntity audio;
  final DateTime playedAt;

  const RecentlyPlayedEntity({required this.audio, required this.playedAt});
}
