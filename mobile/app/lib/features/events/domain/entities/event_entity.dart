import 'event_category_entity.dart';
import 'event_location_entity.dart';
import 'event_speaker_entity.dart';
import 'event_schedule_entity.dart';

class EventEntity {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final EventCategoryEntity category;
  final EventSpeakerEntity speaker;
  final EventLocationEntity location;
  final EventScheduleEntity schedule;
  final String bannerImage;
  final String thumbnail;
  final bool registrationRequired;
  final bool registrationOpen;
  final int maximumCapacity;
  final int registeredCount;
  final bool isFeatured;
  final bool isUpcoming;
  final List<String> tags;

  const EventEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.category,
    required this.speaker,
    required this.location,
    required this.schedule,
    required this.bannerImage,
    required this.thumbnail,
    required this.registrationRequired,
    required this.registrationOpen,
    required this.maximumCapacity,
    required this.registeredCount,
    required this.isFeatured,
    required this.isUpcoming,
    required this.tags,
  });
}
