import '../../domain/entities/notifications_entity.dart';

class NotificationMessageDto extends NotificationMessage {
  const NotificationMessageDto({
    required super.id,
    required super.title,
    required super.body,
    required super.type,
    required super.createdAt,
  });

  factory NotificationMessageDto.fromJson(
    Map<String, dynamic> json, [
    String? id,
  ]) {
    return NotificationMessageDto(
      id: id ?? json['id'] as String? ?? '',
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'body': body,
      'type': type,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
