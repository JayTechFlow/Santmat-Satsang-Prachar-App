import '../../domain/entities/analytics_entity.dart';

class AnalyticsEventDto extends AnalyticsEvent {
  const AnalyticsEventDto({
    required super.id,
    required super.eventName,
    super.userId,
    super.parameters,
    required super.timestamp,
  });

  factory AnalyticsEventDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return AnalyticsEventDto(
      id: id ?? json['id'] as String? ?? '',
      eventName: json['eventName'] as String,
      userId: json['userId'] as String?,
      parameters: json['parameters'] as Map<String, dynamic>?,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'eventName': eventName,
      'userId': userId,
      'parameters': parameters,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
