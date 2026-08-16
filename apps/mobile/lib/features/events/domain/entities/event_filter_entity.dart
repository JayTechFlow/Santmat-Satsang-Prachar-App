class EventFilterEntity {
  final String? categoryId;
  final String? speakerId;
  final String? city;
  final bool? isUpcoming;
  final bool? isFeatured;
  final bool? registrationOpen;

  const EventFilterEntity({
    this.categoryId,
    this.speakerId,
    this.city,
    this.isUpcoming,
    this.isFeatured,
    this.registrationOpen,
  });
}
