import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/events/data/datasources/mock_event_data_source.dart';
import 'package:santmat_satsang_prachar/features/events/data/repositories/event_repository_impl.dart';

void main() {
  late MockEventDataSource dataSource;
  late EventRepositoryImpl repository;

  setUp(() {
    dataSource = MockEventDataSource();
    repository = EventRepositoryImpl(dataSource);
  });

  test('getUpcomingEvents returns Result.success', () async {
    final result = await repository.getUpcomingEvents();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('registerForEvent handles registration success', () async {
    final events = await repository.getUpcomingEvents();
    final eventId = events.data!.first.id;

    final result = await repository.registerForEvent(eventId);
    expect(result.isSuccess, true);
    expect(result.data, isNotNull);
    expect(result.data!.event.id, eventId);
  });
}
