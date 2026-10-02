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
  final int? durationSeconds;
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

  AudioDto({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.speaker,
    required this.categoryId,
    required this.categoryName,
    required this.durationMinutes,
    this.durationSeconds,
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

  factory AudioDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    final imgUrl =
        data['thumbnailUrl'] as String? ??
        data['artworkUrl'] as String? ??
        data['imageUrl'] as String? ??
        '';

    final categoryVal = data['category'];
    String catId = data['categoryId'] as String? ?? '';
    String catName = data['categoryName'] as String? ?? '';
    if (catId.isEmpty && categoryVal is String) {
      catId = categoryVal;
      catName = categoryVal;
    }

    final durationSec = (data['durationSeconds'] as num?)?.toInt();
    final durationMin =
        data['durationMinutes'] as int? ??
        (durationSec != null ? durationSec ~/ 60 : 0);

    DateTime relDate;
    final rawDate =
        data['createdAt'] ?? data['releaseDate'] ?? data['addedDate'];
    if (rawDate is Timestamp) {
      relDate = rawDate.toDate();
    } else if (rawDate is String) {
      relDate = DateTime.tryParse(rawDate) ?? DateTime.now();
    } else {
      relDate = DateTime.now();
    }

    return AudioDto(
      id: doc.id,
      title: data['title'] as String? ?? '',
      subtitle:
          data['subtitle'] as String? ?? data['subCategory'] as String? ?? '',
      description:
          data['description'] as String? ?? data['lyrics'] as String? ?? '',
      speaker: data['speaker'] as String? ?? data['artist'] as String? ?? '',
      categoryId: catId,
      categoryName: catName,
      durationMinutes: durationMin,
      durationSeconds: durationSec,
      language: data['language'] as String? ?? 'hi',
      thumbnailUrl: imgUrl,
      artworkUrl: imgUrl,
      releaseDate: relDate,
      playCount: data['playCount'] as int? ?? data['plays'] as int? ?? 0,
      favoriteCount: data['favoriteCount'] as int? ?? 0,
      isFeatured: data['isFeatured'] as bool? ?? false,
      isRecentlyAdded: data['isRecentlyAdded'] as bool? ?? false,
      isPopular: data['isPopular'] as bool? ?? false,
      audioUrl:
          data['audioUrl'] as String? ?? data['storagePath'] as String? ?? '',
      lyrics: data['lyrics'] as String?,
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
      'durationSeconds': durationSeconds,
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
      duration: durationSeconds != null
          ? Duration(seconds: durationSeconds!)
          : Duration(minutes: durationMinutes),
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
      lyrics: lyrics,
    );
  }
}
