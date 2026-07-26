import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';

class AudioDto {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String speaker;
  final String categoryId;
  final String categoryName;
  final int durationMinutes;
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

  AudioDto({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.speaker,
    required this.categoryId,
    required this.categoryName,
    required this.durationMinutes,
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

  factory AudioDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return AudioDto(
      id: doc.id,
      title: data['title'] as String? ?? '',
      subtitle: data['subtitle'] as String? ?? '',
      description: data['description'] as String? ?? '',
      speaker: data['speaker'] as String? ?? '',
      categoryId: data['categoryId'] as String? ?? '',
      categoryName: data['categoryName'] as String? ?? '',
      durationMinutes: data['durationMinutes'] as int? ?? 0,
      language: data['language'] as String? ?? '',
      thumbnailUrl: data['thumbnailUrl'] as String? ?? '',
      artworkUrl: data['artworkUrl'] as String? ?? '',
      releaseDate:
          (data['releaseDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      playCount: data['playCount'] as int? ?? 0,
      favoriteCount: data['favoriteCount'] as int? ?? 0,
      isFeatured: data['isFeatured'] as bool? ?? false,
      isRecentlyAdded: data['isRecentlyAdded'] as bool? ?? false,
      isPopular: data['isPopular'] as bool? ?? false,
      audioUrl: data['audioUrl'] as String? ?? '',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'subtitle': subtitle,
      'description': description,
      'speaker': speaker,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'durationMinutes': durationMinutes,
      'language': language,
      'thumbnailUrl': thumbnailUrl,
      'artworkUrl': artworkUrl,
      'releaseDate': Timestamp.fromDate(releaseDate),
      'playCount': playCount,
      'favoriteCount': favoriteCount,
      'isFeatured': isFeatured,
      'isRecentlyAdded': isRecentlyAdded,
      'isPopular': isPopular,
      'audioUrl': audioUrl,
    };
  }

  AudioEntity toEntity() {
    return AudioEntity(
      id: id,
      title: title,
      subtitle: subtitle,
      description: description,
      speaker: speaker,
      category: AudioCategoryEntity(id: categoryId, name: categoryName),
      duration: Duration(minutes: durationMinutes),
      language: language,
      thumbnailUrl: thumbnailUrl,
      artworkUrl: artworkUrl,
      releaseDate: releaseDate,
      playCount: playCount,
      favoriteCount: favoriteCount,
      isFeatured: isFeatured,
      isRecentlyAdded: isRecentlyAdded,
      isPopular: isPopular,
      audioUrl: audioUrl,
    );
  }
}
