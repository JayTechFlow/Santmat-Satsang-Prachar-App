import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/events/domain/entities/event_entity.dart';
import 'package:santmat_satsang_prachar/features/events/domain/entities/event_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/events/domain/entities/event_registration_entity.dart';
import 'package:santmat_satsang_prachar/features/events/domain/entities/event_category_entity.dart';
import 'package:santmat_satsang_prachar/features/events/domain/entities/event_speaker_entity.dart';
import 'package:santmat_satsang_prachar/features/events/domain/repositories/event_repository.dart';
import 'package:santmat_satsang_prachar/features/events/domain/usecases/event_usecases.dart';

class MockEventRepository implements EventRepository {
  @override
  Future<Result<List<EventEntity>>> getUpcomingEvents() async =>
      const Result.success([]);

  @override
  Future<Result<List<EventEntity>>> getFeaturedEvents() async =>
      const Result.success([]);

  @override
  Future<Result<EventEntity>> getEventDetails(String id) async =>
      throw UnimplementedError();

  @override
  Future<Result<List<EventEntity>>> searchEvents(String query) async =>
      const Result.success([]);

  @override
  Future<Result<List<EventEntity>>> filterEvents(
    EventFilterEntity filter,
  ) async => const Result.success([]);

  @override
  Future<Result<EventRegistrationEntity>> registerForEvent(
    String eventId,
  ) async => throw UnimplementedError();

  @override
  Future<Result<void>> cancelEventRegistration(String registrationId) async =>
      const Result.success(null);

  @override
  Future<Result<List<EventRegistrationEntity>>> getRegisteredEvents() async =>
      const Result.success([]);

  @override
  Future<Result<List<EventCategoryEntity>>> getCategories() async =>
      const Result.success([]);

  @override
  Future<Result<List<EventSpeakerEntity>>> getSpeakers() async =>
      const Result.success([]);
}

void main() {
  late MockEventRepository repository;
  late GetUpcomingEventsUseCase getUpcomingEventsUseCase;

  setUp(() {
    repository = MockEventRepository();
    getUpcomingEventsUseCase = GetUpcomingEventsUseCase(repository);
  });

  test('GetUpcomingEventsUseCase returns success', () async {
    final result = await getUpcomingEventsUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
