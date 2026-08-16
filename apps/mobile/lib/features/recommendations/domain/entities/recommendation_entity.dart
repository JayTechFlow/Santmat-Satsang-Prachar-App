enum RecommendationType {
  audio,
  satsang,
  book,
  playlist,
  quote,
}

class RecommendationEntity {
  final String id;
  final String title;
  final String subtitle;
  final String category;
  final RecommendationType type;
  final String imageUrl;
  final String targetId;
  final double score;
  final String reason;
  final int durationSeconds;
  final List<String> tags;

  const RecommendationEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.category,
    required this.type,
    required this.imageUrl,
    required this.targetId,
    this.score = 1.0,
    this.reason = 'Recommended for you',
    this.durationSeconds = 0,
    this.tags = const [],
  });
}
