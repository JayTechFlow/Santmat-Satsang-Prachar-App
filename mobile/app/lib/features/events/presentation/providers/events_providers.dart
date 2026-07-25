import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/mock_event_data_source.dart';
import '../../data/repositories/event_repository_impl.dart';
import '../../domain/repositories/event_repository.dart';
import '../../domain/usecases/event_usecases.dart';
import '../../domain/entities/event_entity.dart';
import '../../domain/entities/event_registration_entity.dart';
import 'events_state.dart';

final mockEventDataSourceProvider = Provider((ref) => MockEventDataSource());

final eventRepositoryProvider = Provider<EventRepository>((ref) {
  return EventRepositoryImpl(ref.watch(mockEventDataSourceProvider));
});

final getUpcomingEventsUseCaseProvider = Provider(
  (ref) => GetUpcomingEventsUseCase(ref.watch(eventRepositoryProvider)),
);
final getFeaturedEventsUseCaseProvider = Provider(
  (ref) => GetFeaturedEventsUseCase(ref.watch(eventRepositoryProvider)),
);
final getEventDetailsUseCaseProvider = Provider(
  (ref) => GetEventDetailsUseCase(ref.watch(eventRepositoryProvider)),
);
final getRegisteredEventsUseCaseProvider = Provider(
  (ref) => GetRegisteredEventsUseCase(ref.watch(eventRepositoryProvider)),
);
final registerForEventUseCaseProvider = Provider(
  (ref) => RegisterForEventUseCase(ref.watch(eventRepositoryProvider)),
);
final cancelEventRegistrationUseCaseProvider = Provider(
  (ref) => CancelEventRegistrationUseCase(ref.watch(eventRepositoryProvider)),
);

class EventsNotifier extends Notifier<EventsState> {
  bool _mounted = true;

  @override
  EventsState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadData();
    });
    return const EventsState(isLoading: true);
  }

  Future<void> loadData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final getUpcoming = ref.read(getUpcomingEventsUseCaseProvider);
      final getFeatured = ref.read(getFeaturedEventsUseCaseProvider);

      final results = await Future.wait([getUpcoming(), getFeatured()]);

      if (!_mounted) return;

      final upcoming = results[0];
      final featured = results[1];

      if (upcoming.isError) throw Exception(upcoming.error);
      if (featured.isError) throw Exception(featured.error);

      state = state.copyWith(
        isLoading: false,
        upcomingEvents: upcoming.data as List<EventEntity>,
        featuredEvents: featured.data as List<EventEntity>,
      );
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }
}

final eventsProvider = NotifierProvider<EventsNotifier, EventsState>(
  EventsNotifier.new,
);

final registeredEventsProvider = FutureProvider<List<EventRegistrationEntity>>((
  ref,
) async {
  final res = await ref.read(getRegisteredEventsUseCaseProvider).call();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

final eventDetailsProvider = FutureProvider.family<EventEntity, String>((
  ref,
  id,
) async {
  final res = await ref.read(getEventDetailsUseCaseProvider).call(id);
  if (res.isError) throw Exception(res.error);
  return res.data!;
});
