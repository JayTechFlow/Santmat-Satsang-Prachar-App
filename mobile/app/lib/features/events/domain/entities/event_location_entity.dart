class EventLocationEntity {
  final String venue;
  final String address;
  final String city;
  final String state;
  final String country;
  final double latitude;
  final double longitude;

  const EventLocationEntity({
    required this.venue,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.latitude,
    required this.longitude,
  });
}
