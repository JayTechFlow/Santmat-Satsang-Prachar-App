class NotificationMessage {
  final String id;
  final String title;
  final String body;
  final String type;
  final DateTime createdAt;

  const NotificationMessage({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
  });
}
