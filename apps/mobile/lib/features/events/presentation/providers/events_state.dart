import '../../domain/entities/event_entity.dart';
import '../../domain/entities/event_category_entity.dart';
import '../../domain/entities/event_speaker_entity.dart';

class EventsState {
  final bool isLoading;
  final String? error;
  final List<EventEntity> upcomingEvents;
  final List<EventEntity> featuredEvents;
  final List<EventCategoryEntity> categories;
  final List<EventSpeakerEntity> speakers;

  const EventsState({
    this.isLoading = false,
    this.error,
    this.upcomingEvents = const [],
    this.featuredEvents = const [],
    this.categories = const [],
    this.speakers = const [],
  });

  EventsState copyWith({
    bool? isLoading,
    String? error,
    List<EventEntity>? upcomingEvents,
    List<EventEntity>? featuredEvents,
    List<EventCategoryEntity>? categories,
    List<EventSpeakerEntity>? speakers,
  }) {
    return EventsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      upcomingEvents: upcomingEvents ?? this.upcomingEvents,
      featuredEvents: featuredEvents ?? this.featuredEvents,
      categories: categories ?? this.categories,
      speakers: speakers ?? this.speakers,
    );
  }
}
