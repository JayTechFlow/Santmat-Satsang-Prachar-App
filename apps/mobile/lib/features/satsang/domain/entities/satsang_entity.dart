import 'satsang_category_entity.dart';
import 'speaker_entity.dart';

class SatsangEntity {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final SpeakerEntity speaker;
  final SatsangCategoryEntity category;
  final Duration duration;
  final String language;
  final DateTime date;
  final String location;
  final String thumbnailUrl;
  final String coverImageUrl;
  final String videoUrl;
  final String audioUrl;
  final List<String> tags;
  final bool isFeatured;
  final bool isPopular;
  final bool isRecentlyAdded;

  const SatsangEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.speaker,
    required this.category,
    required this.duration,
    required this.language,
    required this.date,
    required this.location,
    required this.thumbnailUrl,
    required this.coverImageUrl,
    required this.videoUrl,
    required this.audioUrl,
    required this.tags,
    required this.isFeatured,
    required this.isPopular,
    required this.isRecentlyAdded,
  });
}

class SatsangSessionEntity {
  final SatsangEntity satsang;
  final Duration currentPosition;
  final bool isCompleted;

  const SatsangSessionEntity({
    required this.satsang,
    required this.currentPosition,
    required this.isCompleted,
  });
}
