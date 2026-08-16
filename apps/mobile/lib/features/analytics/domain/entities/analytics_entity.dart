class AnalyticsEvent {
  final String id;
  final String eventName;
  final String? userId;
  final Map<String, dynamic>? parameters;
  final DateTime timestamp;

  const AnalyticsEvent({
    required this.id,
    required this.eventName,
    this.userId,
    this.parameters,
    required this.timestamp,
  });
}
