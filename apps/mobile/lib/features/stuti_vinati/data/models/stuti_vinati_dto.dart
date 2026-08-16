import '../../domain/entities/stuti_vinati_entity.dart';

class StutiVinatiDto extends StutiVinati {
  const StutiVinatiDto({
    required super.id,
    required super.title,
    super.textContent,
    super.audioUrl,
    required super.type,
  });

  factory StutiVinatiDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return StutiVinatiDto(
      id: id ?? json['id'] as String? ?? '',
      title: json['title'] as String,
      textContent: json['textContent'] as String?,
      audioUrl: json['audioUrl'] as String?,
      type: json['type'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'textContent': textContent,
      'audioUrl': audioUrl,
      'type': type,
    };
  }
}
