import '../../domain/entities/home_banners_entity.dart';

class HomeBannerDto extends HomeBanner {
  const HomeBannerDto({
    required super.id,
    required super.imageUrl,
    super.linkUrl,
    required super.isActive,
    required super.sortOrder,
  });

  factory HomeBannerDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return HomeBannerDto(
      id: id ?? json['id'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      linkUrl: json['linkUrl'] as String? ?? json['targetScreen'] as String?,
      isActive: json['isActive'] as bool? ?? json['active'] as bool? ?? true,
      sortOrder: json['sortOrder'] as int? ?? json['order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'imageUrl': imageUrl,
      'linkUrl': linkUrl,
      'isActive': isActive,
      'sortOrder': sortOrder,
    };
  }
}
