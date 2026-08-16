import '../../domain/entities/event_entity.dart';
import '../../domain/entities/event_category_entity.dart';
import '../../domain/entities/event_speaker_entity.dart';
import '../../domain/entities/event_registration_entity.dart';
import '../../domain/entities/event_filter_entity.dart';

abstract class EventDataSource {
  Future<List<EventEntity>> getUpcomingEvents();
  Future<List<EventEntity>> getFeaturedEvents();
  Future<EventEntity> getEventDetails(String id);
  Future<List<EventEntity>> searchEvents(String query);
  Future<List<EventEntity>> filterEvents(EventFilterEntity filter);
  Future<EventRegistrationEntity> registerForEvent(String eventId);
  Future<void> cancelEventRegistration(String registrationId);
  Future<List<EventRegistrationEntity>> getRegisteredEvents();
  Future<List<EventCategoryEntity>> getCategories();
  Future<List<EventSpeakerEntity>> getSpeakers();
}
