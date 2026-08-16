import '../../../../core/utils/result.dart';
import '../entities/event_entity.dart';
import '../entities/event_filter_entity.dart';
import '../entities/event_registration_entity.dart';
import '../entities/event_category_entity.dart';
import '../entities/event_speaker_entity.dart';

abstract class EventRepository {
  Future<Result<List<EventEntity>>> getUpcomingEvents();
  Future<Result<List<EventEntity>>> getFeaturedEvents();
  Future<Result<EventEntity>> getEventDetails(String id);
  Future<Result<List<EventEntity>>> searchEvents(String query);
  Future<Result<List<EventEntity>>> filterEvents(EventFilterEntity filter);
  Future<Result<EventRegistrationEntity>> registerForEvent(String eventId);
  Future<Result<void>> cancelEventRegistration(String registrationId);
  Future<Result<List<EventRegistrationEntity>>> getRegisteredEvents();
  Future<Result<List<EventCategoryEntity>>> getCategories();
  Future<Result<List<EventSpeakerEntity>>> getSpeakers();
}
