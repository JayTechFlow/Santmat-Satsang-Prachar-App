import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/event_entity.dart';
import '../../domain/entities/event_category_entity.dart';
import '../../domain/entities/event_location_entity.dart';
import '../../domain/entities/event_speaker_entity.dart';
import '../../domain/entities/event_schedule_entity.dart';

class EventDto {
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

  EventDto({
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

  factory EventDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    final categoryMap = data['category'] as Map<String, dynamic>? ?? {};
    final category = EventCategoryEntity(
      id: categoryMap['id'] as String? ?? '',
      name: categoryMap['name'] as String? ?? '',
    );

    final speakerMap = data['speaker'] as Map<String, dynamic>? ?? {};
    final speaker = EventSpeakerEntity(
      id: speakerMap['id'] as String? ?? '',
      name: speakerMap['name'] as String? ?? '',
      title: speakerMap['title'] as String? ?? '',
      imageUrl: speakerMap['imageUrl'] as String? ?? '',
    );

    final locationMap = data['location'] as Map<String, dynamic>? ?? {};
    final location = EventLocationEntity(
      venue: locationMap['venue'] as String? ?? '',
      address: locationMap['address'] as String? ?? '',
      city: locationMap['city'] as String? ?? '',
      state: locationMap['state'] as String? ?? '',
      country: locationMap['country'] as String? ?? '',
      latitude: (locationMap['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (locationMap['longitude'] as num?)?.toDouble() ?? 0.0,
    );

    final scheduleMap = data['schedule'] as Map<String, dynamic>? ?? {};
    final schedule = EventScheduleEntity(
      startDate:
          (scheduleMap['startDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      endDate:
          (scheduleMap['endDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      startTime: scheduleMap['startTime'] as String? ?? '',
      endTime: scheduleMap['endTime'] as String? ?? '',
    );

    return EventDto(
      id: doc.id,
      title: data['title'] as String? ?? '',
      subtitle: data['subtitle'] as String? ?? '',
      description: data['description'] as String? ?? '',
      category: category,
      speaker: speaker,
      location: location,
      schedule: schedule,
      bannerImage: data['bannerImage'] as String? ?? '',
      thumbnail: data['thumbnail'] as String? ?? '',
      registrationRequired: data['registrationRequired'] as bool? ?? false,
      registrationOpen: data['registrationOpen'] as bool? ?? false,
      maximumCapacity: data['maximumCapacity'] as int? ?? 0,
      registeredCount: data['registeredCount'] as int? ?? 0,
      isFeatured: data['isFeatured'] as bool? ?? false,
      isUpcoming: data['isUpcoming'] as bool? ?? false,
      tags: List<String>.from(data['tags'] ?? []),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'subtitle': subtitle,
      'description': description,
      'category': {'id': category.id, 'name': category.name},
      'speaker': {
        'id': speaker.id,
        'name': speaker.name,
        'title': speaker.title,
        'imageUrl': speaker.imageUrl,
      },
      'location': {
        'venue': location.venue,
        'address': location.address,
        'city': location.city,
        'state': location.state,
        'country': location.country,
        'latitude': location.latitude,
        'longitude': location.longitude,
      },
      'schedule': {
        'startDate': Timestamp.fromDate(schedule.startDate),
        'endDate': Timestamp.fromDate(schedule.endDate),
        'startTime': schedule.startTime,
        'endTime': schedule.endTime,
      },
      'bannerImage': bannerImage,
      'thumbnail': thumbnail,
      'registrationRequired': registrationRequired,
      'registrationOpen': registrationOpen,
      'maximumCapacity': maximumCapacity,
      'registeredCount': registeredCount,
      'isFeatured': isFeatured,
      'isUpcoming': isUpcoming,
      'tags': tags,
    };
  }

  EventEntity toEntity() {
    return EventEntity(
      id: id,
      title: title,
      subtitle: subtitle,
      description: description,
      category: category,
      speaker: speaker,
      location: location,
      schedule: schedule,
      bannerImage: bannerImage,
      thumbnail: thumbnail,
      registrationRequired: registrationRequired,
      registrationOpen: registrationOpen,
      maximumCapacity: maximumCapacity,
      registeredCount: registeredCount,
      isFeatured: isFeatured,
      isUpcoming: isUpcoming,
      tags: tags,
    );
  }
}
