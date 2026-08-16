import '../../../../core/utils/result.dart';
import '../entities/event_entity.dart';
import '../entities/event_filter_entity.dart';
import '../entities/event_registration_entity.dart';
import '../repositories/event_repository.dart';

class GetUpcomingEventsUseCase {
  final EventRepository repository;
  GetUpcomingEventsUseCase(this.repository);
  Future<Result<List<EventEntity>>> call() => repository.getUpcomingEvents();
}

class GetFeaturedEventsUseCase {
  final EventRepository repository;
  GetFeaturedEventsUseCase(this.repository);
  Future<Result<List<EventEntity>>> call() => repository.getFeaturedEvents();
}

class GetEventDetailsUseCase {
  final EventRepository repository;
  GetEventDetailsUseCase(this.repository);
  Future<Result<EventEntity>> call(String id) => repository.getEventDetails(id);
}

class SearchEventsUseCase {
  final EventRepository repository;
  SearchEventsUseCase(this.repository);
  Future<Result<List<EventEntity>>> call(String query) =>
      repository.searchEvents(query);
}

class FilterEventsUseCase {
  final EventRepository repository;
  FilterEventsUseCase(this.repository);
  Future<Result<List<EventEntity>>> call(EventFilterEntity filter) =>
      repository.filterEvents(filter);
}

class RegisterForEventUseCase {
  final EventRepository repository;
  RegisterForEventUseCase(this.repository);
  Future<Result<EventRegistrationEntity>> call(String eventId) =>
      repository.registerForEvent(eventId);
}

class CancelEventRegistrationUseCase {
  final EventRepository repository;
  CancelEventRegistrationUseCase(this.repository);
  Future<Result<void>> call(String registrationId) =>
      repository.cancelEventRegistration(registrationId);
}

class GetRegisteredEventsUseCase {
  final EventRepository repository;
  GetRegisteredEventsUseCase(this.repository);
  Future<Result<List<EventRegistrationEntity>>> call() =>
      repository.getRegisteredEvents();
}
