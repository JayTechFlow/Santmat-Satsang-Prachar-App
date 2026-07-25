import 'event_entity.dart';

class EventRegistrationEntity {
  final String id;
  final EventEntity event;
  final DateTime registeredAt;
  final String status;
  final String ticketCode;

  const EventRegistrationEntity({
    required this.id,
    required this.event,
    required this.registeredAt,
    required this.status,
    required this.ticketCode,
  });
}
