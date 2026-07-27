import '../../domain/entities/daily_suvichar_entity.dart';

class DailySuvicharDto extends DailySuvichar {
  const DailySuvicharDto({
    required super.id,
    required super.text,
    super.imageUrl,
    required super.date,
  });

  factory DailySuvicharDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return DailySuvicharDto(
      id: id ?? json['id'] as String? ?? '',
      text: json['text'] as String,
      imageUrl: json['imageUrl'] as String?,
      date: json['date'] != null
          ? DateTime.parse(json['date'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'text': text, 'imageUrl': imageUrl, 'date': date.toIso8601String()};
  }
}
