import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/events/presentation/providers/events_providers.dart';
import 'package:santmat_satsang_prachar/features/events/data/datasources/mock_event_data_source.dart';

void main() {
  test('EventsNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        mockEventDataSourceProvider.overrideWithValue(MockEventDataSource()),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(eventsProvider);
    expect(state.isLoading, true);

    await container.read(eventsProvider.notifier).loadData();
    state = container.read(eventsProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.upcomingEvents, isNotEmpty);
    expect(state.featuredEvents, isNotEmpty);
  });
}
