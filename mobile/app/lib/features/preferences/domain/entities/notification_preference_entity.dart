class NotificationPreferenceEntity {
  final bool enableAll;
  final bool newSatsangAlerts;
  final bool dailyQuotes;
  final bool eventReminders;
  final bool appUpdates;

  const NotificationPreferenceEntity({
    required this.enableAll,
    required this.newSatsangAlerts,
    required this.dailyQuotes,
    required this.eventReminders,
    required this.appUpdates,
  });

  NotificationPreferenceEntity copyWith({
    bool? enableAll,
    bool? newSatsangAlerts,
    bool? dailyQuotes,
    bool? eventReminders,
    bool? appUpdates,
  }) {
    return NotificationPreferenceEntity(
      enableAll: enableAll ?? this.enableAll,
      newSatsangAlerts: newSatsangAlerts ?? this.newSatsangAlerts,
      dailyQuotes: dailyQuotes ?? this.dailyQuotes,
      eventReminders: eventReminders ?? this.eventReminders,
      appUpdates: appUpdates ?? this.appUpdates,
    );
  }
}
