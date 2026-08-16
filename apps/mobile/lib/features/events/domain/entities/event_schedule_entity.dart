class EventScheduleEntity {
  final DateTime startDate;
  final DateTime endDate;
  final String startTime;
  final String endTime;

  const EventScheduleEntity({
    required this.startDate,
    required this.endDate,
    required this.startTime,
    required this.endTime,
  });
}
