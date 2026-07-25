import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/satsang_entity.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../domain/entities/speaker_entity.dart';

class SatsangDto {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String speakerId;
  final String speakerName;
  final String? speakerPhotoUrl;
  final String? speakerBio;
  final String categoryId;
  final String categoryName;
  final int durationMinutes;
  final String language;
  final DateTime date;
  final String location;
  final String thumbnailUrl;
  final String coverImageUrl;
  final List<String> tags;
  final bool isFeatured;
  final bool isPopular;
  final bool isRecentlyAdded;

  SatsangDto({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.speakerId,
    required this.speakerName,
    this.speakerPhotoUrl,
    this.speakerBio,
    required this.categoryId,
    required this.categoryName,
    required this.durationMinutes,
    required this.language,
    required this.date,
    required this.location,
    required this.thumbnailUrl,
    required this.coverImageUrl,
    required this.tags,
    required this.isFeatured,
    required this.isPopular,
    required this.isRecentlyAdded,
  });

  factory SatsangDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return SatsangDto(
      id: doc.id,
      title: data['title'] as String? ?? '',
      subtitle: data['subtitle'] as String? ?? '',
      description: data['description'] as String? ?? '',
      speakerId: data['speakerId'] as String? ?? '',
      speakerName: data['speakerName'] as String? ?? '',
      speakerPhotoUrl: data['speakerPhotoUrl'] as String?,
      speakerBio: data['speakerBio'] as String?,
      categoryId: data['categoryId'] as String? ?? '',
      categoryName: data['categoryName'] as String? ?? '',
      durationMinutes: data['durationMinutes'] as int? ?? 0,
      language: data['language'] as String? ?? '',
      date: (data['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
      location: data['location'] as String? ?? '',
      thumbnailUrl: data['thumbnailUrl'] as String? ?? '',
      coverImageUrl: data['coverImageUrl'] as String? ?? '',
      tags: List<String>.from(data['tags'] ?? []),
      isFeatured: data['isFeatured'] as bool? ?? false,
      isPopular: data['isPopular'] as bool? ?? false,
      isRecentlyAdded: data['isRecentlyAdded'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'subtitle': subtitle,
      'description': description,
      'speakerId': speakerId,
      'speakerName': speakerName,
      'speakerPhotoUrl': speakerPhotoUrl,
      'speakerBio': speakerBio,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'durationMinutes': durationMinutes,
      'language': language,
      'date': Timestamp.fromDate(date),
      'location': location,
      'thumbnailUrl': thumbnailUrl,
      'coverImageUrl': coverImageUrl,
      'tags': tags,
      'isFeatured': isFeatured,
      'isPopular': isPopular,
      'isRecentlyAdded': isRecentlyAdded,
    };
  }

  SatsangEntity toEntity() {
    return SatsangEntity(
      id: id,
      title: title,
      subtitle: subtitle,
      description: description,
      speaker: SpeakerEntity(
        id: speakerId,
        name: speakerName,
        photoUrl: speakerPhotoUrl,
        bio: speakerBio,
      ),
      category: SatsangCategoryEntity(
        id: categoryId,
        name: categoryName,
      ),
      duration: Duration(minutes: durationMinutes),
      language: language,
      date: date,
      location: location,
      thumbnailUrl: thumbnailUrl,
      coverImageUrl: coverImageUrl,
      tags: tags,
      isFeatured: isFeatured,
      isPopular: isPopular,
      isRecentlyAdded: isRecentlyAdded,
    );
  }
}
