class UpcomingEventEntity {
  final String id;
  final String title;
  final String location;
  final DateTime startDate;
  final DateTime endDate;
  final String? imageUrl;

  const UpcomingEventEntity({
    required this.id,
    required this.title,
    required this.location,
    required this.startDate,
    required this.endDate,
    this.imageUrl,
  });
}
