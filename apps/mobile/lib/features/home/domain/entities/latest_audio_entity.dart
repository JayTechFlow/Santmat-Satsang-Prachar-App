class LatestAudioEntity {
  final String id;
  final String title;
  final String speaker;
  final String audioUrl;
  final Duration duration;

  const LatestAudioEntity({
    required this.id,
    required this.title,
    required this.speaker,
    required this.audioUrl,
    required this.duration,
  });
}
