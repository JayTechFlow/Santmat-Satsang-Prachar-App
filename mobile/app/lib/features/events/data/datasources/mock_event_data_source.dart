import '../../domain/entities/event_entity.dart';
import '../../domain/entities/event_category_entity.dart';
import '../../domain/entities/event_location_entity.dart';
import '../../domain/entities/event_speaker_entity.dart';
import '../../domain/entities/event_schedule_entity.dart';
import '../../domain/entities/event_registration_entity.dart';
import '../../domain/entities/event_filter_entity.dart';

class MockEventDataSource {
  final List<EventCategoryEntity> _categories = [
    const EventCategoryEntity(id: 'c1', name: 'Satsang Program'),
    const EventCategoryEntity(id: 'c2', name: 'Meditation Camp'),
    const EventCategoryEntity(id: 'c3', name: 'Special Occasion'),
  ];

  final List<EventSpeakerEntity> _speakers = [
    const EventSpeakerEntity(
      id: 's1',
      name: 'Maharshi Mehi',
      title: 'Paramhans',
      imageUrl: 'https://picsum.photos/seed/s1/200',
    ),
    const EventSpeakerEntity(
      id: 's2',
      name: 'Swami Santsevi',
      title: 'Ji Maharaj',
      imageUrl: 'https://picsum.photos/seed/s2/200',
    ),
  ];

  late final List<EventEntity> _events;
  final List<EventRegistrationEntity> _registrations = [];

  MockEventDataSource() {
    _events = List.generate(10, (index) {
      final isUpcoming = index < 5;
      final startDate = isUpcoming
          ? DateTime.now().add(Duration(days: index * 2 + 1))
          : DateTime.now().subtract(Duration(days: index * 5 + 1));

      return EventEntity(
        id: 'event_$index',
        title: 'Spiritual Gathering $index',
        subtitle: 'Annual Event $index',
        description: 'Join us for a deeply moving spiritual gathering.',
        category: _categories[index % _categories.length],
        speaker: _speakers[index % _speakers.length],
        location: EventLocationEntity(
          venue: 'Ashram Hall $index',
          address: '123 Peace Rd',
          city: 'Haridwar',
          state: 'Uttarakhand',
          country: 'India',
          latitude: 29.9457,
          longitude: 78.1642,
        ),
        schedule: EventScheduleEntity(
          startDate: startDate,
          endDate: startDate.add(const Duration(days: 2)),
          startTime: '08:00 AM',
          endTime: '05:00 PM',
        ),
        bannerImage: 'https://picsum.photos/seed/event_banner_$index/600/300',
        thumbnail: 'https://picsum.photos/seed/event_thumb_$index/200/200',
        registrationRequired: true,
        registrationOpen: isUpcoming,
        maximumCapacity: 500,
        registeredCount: 150 + (index * 10),
        isFeatured: index == 0 || index == 1,
        isUpcoming: isUpcoming,
        tags: ['Meditation', 'Peace', 'Satsang'],
      );
    });
  }

  Future<List<EventEntity>> getUpcomingEvents() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _events.where((e) => e.isUpcoming).toList();
  }

  Future<List<EventEntity>> getFeaturedEvents() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _events.where((e) => e.isFeatured).toList();
  }

  Future<EventEntity> getEventDetails(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _events.firstWhere((e) => e.id == id);
  }

  Future<List<EventEntity>> searchEvents(String query) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final q = query.toLowerCase();
    return _events.where((e) {
      return e.title.toLowerCase().contains(q) ||
          e.speaker.name.toLowerCase().contains(q) ||
          e.location.city.toLowerCase().contains(q);
    }).toList();
  }

  Future<List<EventEntity>> filterEvents(EventFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _events.where((e) {
      if (filter.categoryId != null && e.category.id != filter.categoryId) {
        return false;
      }
      if (filter.speakerId != null && e.speaker.id != filter.speakerId) {
        return false;
      }
      if (filter.city != null && e.location.city != filter.city) {
        return false;
      }
      if (filter.isUpcoming != null && e.isUpcoming != filter.isUpcoming) {
        return false;
      }
      if (filter.isFeatured != null && e.isFeatured != filter.isFeatured) {
        return false;
      }
      if (filter.registrationOpen != null &&
          e.registrationOpen != filter.registrationOpen) {
        return false;
      }
      return true;
    }).toList();
  }

  Future<EventRegistrationEntity> registerForEvent(String eventId) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final event = _events.firstWhere((e) => e.id == eventId);
    if (!event.registrationOpen) {
      throw Exception('Registration is closed for this event.');
    }

    final existing = _registrations
        .where((r) => r.event.id == eventId)
        .toList();
    if (existing.isNotEmpty) {
      throw Exception('Already registered for this event.');
    }

    final reg = EventRegistrationEntity(
      id: 'reg_${DateTime.now().millisecondsSinceEpoch}',
      event: event,
      registeredAt: DateTime.now(),
      status: 'CONFIRMED',
      ticketCode:
          'TK-${eventId.toUpperCase()}-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
    );
    _registrations.add(reg);
    return reg;
  }

  Future<void> cancelEventRegistration(String registrationId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _registrations.removeWhere((r) => r.id == registrationId);
  }

  Future<List<EventRegistrationEntity>> getRegisteredEvents() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _registrations;
  }

  Future<List<EventCategoryEntity>> getCategories() async => _categories;
  Future<List<EventSpeakerEntity>> getSpeakers() async => _speakers;
}
