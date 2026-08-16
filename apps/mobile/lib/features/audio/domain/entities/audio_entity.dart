import 'audio_category_entity.dart';

class AudioEntity {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String speaker;
  final AudioCategoryEntity category;
  final Duration duration;
  final String language;
  final String thumbnailUrl;
  final String artworkUrl;
  final DateTime releaseDate;
  final int playCount;
  final int favoriteCount;
  final bool isFeatured;
  final bool isRecentlyAdded;
  final bool isPopular;
  final String audioUrl;

  const AudioEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.speaker,
    required this.category,
    required this.duration,
    required this.language,
    required this.thumbnailUrl,
    required this.artworkUrl,
    required this.releaseDate,
    required this.playCount,
    required this.favoriteCount,
    required this.isFeatured,
    required this.isRecentlyAdded,
    required this.isPopular,
    required this.audioUrl,
  });
}
