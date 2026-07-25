class NotificationPreferenceEntity {
  final bool generalNotifications;
  final bool satsangNotifications;
  final bool audioNotifications;
  final bool booksNotifications;
  final bool dailyQuotes;
  final bool events;
  final bool donationUpdates;
  final bool announcements;
  final bool sound;
  final bool vibration;
  final bool quietHoursEnabled;
  final String quietHoursStart;
  final String quietHoursEnd;

  const NotificationPreferenceEntity({
    required this.generalNotifications,
    required this.satsangNotifications,
    required this.audioNotifications,
    required this.booksNotifications,
    required this.dailyQuotes,
    required this.events,
    required this.donationUpdates,
    required this.announcements,
    required this.sound,
    required this.vibration,
    required this.quietHoursEnabled,
    required this.quietHoursStart,
    required this.quietHoursEnd,
  });
}
