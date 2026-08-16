import '../../domain/entities/recommendation_entity.dart';

class RecommendationDto {
  final String id;
  final String title;
  final String subtitle;
  final String category;
  final String type;
  final String imageUrl;
  final String targetId;
  final double score;
  final String reason;
  final int durationSeconds;
  final List<String> tags;

  const RecommendationDto({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.category,
    required this.type,
    required this.imageUrl,
    required this.targetId,
    required this.score,
    required this.reason,
    required this.durationSeconds,
    required this.tags,
  });

  factory RecommendationDto.fromJson(Map<String, dynamic> json, [String? docId]) {
    return RecommendationDto(
      id: docId ?? (json['id'] as String? ?? ''),
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      type: json['type'] as String? ?? 'audio',
      imageUrl: json['imageUrl'] as String? ?? '',
      targetId: json['targetId'] as String? ?? '',
      score: (json['score'] as num?)?.toDouble() ?? 1.0,
      reason: json['reason'] as String? ?? 'Recommended for you',
      durationSeconds: (json['durationSeconds'] as num?)?.toInt() ?? 0,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'category': category,
      'type': type,
      'imageUrl': imageUrl,
      'targetId': targetId,
      'score': score,
      'reason': reason,
      'durationSeconds': durationSeconds,
      'tags': tags,
    };
  }

  RecommendationEntity toEntity() {
    RecommendationType recType;
    switch (type.toLowerCase()) {
      case 'satsang':
        recType = RecommendationType.satsang;
        break;
      case 'book':
        recType = RecommendationType.book;
        break;
      case 'playlist':
        recType = RecommendationType.playlist;
        break;
      case 'quote':
        recType = RecommendationType.quote;
        break;
      case 'audio':
      default:
        recType = RecommendationType.audio;
        break;
    }

    return RecommendationEntity(
      id: id,
      title: title,
      subtitle: subtitle,
      category: category,
      type: recType,
      imageUrl: imageUrl,
      targetId: targetId,
      score: score,
      reason: reason,
      durationSeconds: durationSeconds,
      tags: tags,
    );
  }

  factory RecommendationDto.fromEntity(RecommendationEntity entity) {
    return RecommendationDto(
      id: entity.id,
      title: entity.title,
      subtitle: entity.subtitle,
      category: entity.category,
      type: entity.type.name,
      imageUrl: entity.imageUrl,
      targetId: entity.targetId,
      score: entity.score,
      reason: entity.reason,
      durationSeconds: entity.durationSeconds,
      tags: entity.tags,
    );
  }
}
