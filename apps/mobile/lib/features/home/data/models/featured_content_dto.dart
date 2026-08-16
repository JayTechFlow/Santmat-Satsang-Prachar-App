import '../../domain/entities/featured_content_entity.dart';

class FeaturedContentDto extends FeaturedContent {
  const FeaturedContentDto({
    required super.id,
    required super.title,
    super.description,
    required super.type,
    required super.contentId,
    super.imageUrl,
  });

  factory FeaturedContentDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return FeaturedContentDto(
      id: id ?? json['id'] as String? ?? '',
      title: json['title'] as String,
      description: json['description'] as String?,
      type: json['type'] as String,
      contentId: json['contentId'] as String,
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'type': type,
      'contentId': contentId,
      'imageUrl': imageUrl,
    };
  }
}
