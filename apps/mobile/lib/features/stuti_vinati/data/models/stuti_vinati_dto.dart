import '../../domain/entities/stuti_vinati_entity.dart';

class StutiVinatiDto extends StutiVinati {
  const StutiVinatiDto({
    required super.id,
    required super.title,
    super.subtitle,
    super.artist,
    super.duration,
    super.bannerImage,
    super.textContent,
    super.audioUrl,
    required super.type,
    super.isFavorite,
  });

  factory StutiVinatiDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return StutiVinatiDto(
      id: id ?? json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String?,
      artist: json['artist'] as String?,
      duration: json['duration'] as String?,
      bannerImage: json['bannerImage'] as String?,
      textContent: (json['textContent'] ?? json['lyrics']) as String?,
      audioUrl: json['audioUrl'] as String?,
      type: json['type'] as String? ?? 'morning',
      isFavorite: json['isFavorite'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'subtitle': subtitle,
      'artist': artist,
      'duration': duration,
      'bannerImage': bannerImage,
      'textContent': textContent,
      'lyrics': textContent,
      'audioUrl': audioUrl,
      'type': type,
      'isFavorite': isFavorite,
    };
  }
}
