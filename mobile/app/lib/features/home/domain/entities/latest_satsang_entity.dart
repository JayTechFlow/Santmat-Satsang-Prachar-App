class LatestSatsangEntity {
  final String id;
  final String title;
  final String speaker;
  final DateTime date;
  final String thumbnailUrl;
  final String videoUrl;
  final Duration duration;

  const LatestSatsangEntity({
    required this.id,
    required this.title,
    required this.speaker,
    required this.date,
    required this.thumbnailUrl,
    required this.videoUrl,
    required this.duration,
  });
}
