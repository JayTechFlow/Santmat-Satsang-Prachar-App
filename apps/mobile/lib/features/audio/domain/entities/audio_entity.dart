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
  final String? lyrics;

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
    this.lyrics,
  });

  AudioEntity copyWith({
    String? id,
    String? title,
    String? subtitle,
    String? description,
    String? speaker,
    AudioCategoryEntity? category,
    Duration? duration,
    String? language,
    String? thumbnailUrl,
    String? artworkUrl,
    DateTime? releaseDate,
    int? playCount,
    int? favoriteCount,
    bool? isFeatured,
    bool? isRecentlyAdded,
    bool? isPopular,
    String? audioUrl,
    String? lyrics,
  }) {
    return AudioEntity(
      id: id ?? this.id,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      description: description ?? this.description,
      speaker: speaker ?? this.speaker,
      category: category ?? this.category,
      duration: duration ?? this.duration,
      language: language ?? this.language,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      artworkUrl: artworkUrl ?? this.artworkUrl,
      releaseDate: releaseDate ?? this.releaseDate,
      playCount: playCount ?? this.playCount,
      favoriteCount: favoriteCount ?? this.favoriteCount,
      isFeatured: isFeatured ?? this.isFeatured,
      isRecentlyAdded: isRecentlyAdded ?? this.isRecentlyAdded,
      isPopular: isPopular ?? this.isPopular,
      audioUrl: audioUrl ?? this.audioUrl,
      lyrics: lyrics ?? this.lyrics,
    );
  }
}
