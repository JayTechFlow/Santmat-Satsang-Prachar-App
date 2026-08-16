import '../../../../core/utils/result.dart';
import '../../domain/entities/event_entity.dart';
import '../../domain/entities/event_filter_entity.dart';
import '../../domain/entities/event_registration_entity.dart';
import '../../domain/entities/event_category_entity.dart';
import '../../domain/entities/event_speaker_entity.dart';
import '../../domain/repositories/event_repository.dart';
import '../datasources/event_data_source.dart';

class EventRepositoryImpl implements EventRepository {
  final EventDataSource dataSource;

  EventRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<EventEntity>>> getUpcomingEvents() async {
    try {
      final res = await dataSource.getUpcomingEvents();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<EventEntity>>> getFeaturedEvents() async {
    try {
      final res = await dataSource.getFeaturedEvents();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<EventEntity>> getEventDetails(String id) async {
    try {
      final res = await dataSource.getEventDetails(id);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<EventEntity>>> searchEvents(String query) async {
    try {
      final res = await dataSource.searchEvents(query);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<EventEntity>>> filterEvents(
    EventFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.filterEvents(filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<EventRegistrationEntity>> registerForEvent(
    String eventId,
  ) async {
    try {
      final res = await dataSource.registerForEvent(eventId);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> cancelEventRegistration(String registrationId) async {
    try {
      await dataSource.cancelEventRegistration(registrationId);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<EventRegistrationEntity>>> getRegisteredEvents() async {
    try {
      final res = await dataSource.getRegisteredEvents();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<EventCategoryEntity>>> getCategories() async {
    try {
      final res = await dataSource.getCategories();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<EventSpeakerEntity>>> getSpeakers() async {
    try {
      final res = await dataSource.getSpeakers();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
