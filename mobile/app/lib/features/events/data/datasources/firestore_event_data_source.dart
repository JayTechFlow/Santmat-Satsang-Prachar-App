import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/event_entity.dart';
import '../../domain/entities/event_category_entity.dart';
import '../../domain/entities/event_speaker_entity.dart';
import '../../domain/entities/event_registration_entity.dart';
import '../../domain/entities/event_filter_entity.dart';
import 'event_data_source.dart';
import '../models/event_dto.dart';

class FirestoreEventDataSource implements EventDataSource {
  final FirestoreService _firestoreService;

  FirestoreEventDataSource(this._firestoreService);

  @override
  Future<List<EventEntity>> getUpcomingEvents() async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.events,
      (q) => q
          .where('isUpcoming', isEqualTo: true)
          .orderBy('schedule.startDate', descending: false),
    );
    return snapshot.docs
        .map((doc) => EventDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<EventEntity>> getFeaturedEvents() async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.events,
      (q) => q.where('isFeatured', isEqualTo: true),
    );
    return snapshot.docs
        .map((doc) => EventDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<EventEntity> getEventDetails(String id) async {
    final doc = await _firestoreService.getDocument(
      FirestoreCollections.events,
      id,
    );
    if (!doc.exists) throw Exception('Event not found');
    return EventDto.fromFirestore(doc).toEntity();
  }

  @override
  Future<List<EventEntity>> searchEvents(String query) async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.events,
      (q) => q
          .where('title', isGreaterThanOrEqualTo: query)
          .where('title', isLessThanOrEqualTo: '$query\uf8ff'),
    );
    return snapshot.docs
        .map((doc) => EventDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<EventEntity>> filterEvents(EventFilterEntity filter) async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.events,
      (q) {
        var query = q as Query<Map<String, dynamic>>;
        if (filter.categoryId != null) {
          query = query.where('category.id', isEqualTo: filter.categoryId);
        }
        if (filter.speakerId != null) {
          query = query.where('speaker.id', isEqualTo: filter.speakerId);
        }
        if (filter.city != null) {
          query = query.where('location.city', isEqualTo: filter.city);
        }
        if (filter.isUpcoming != null) {
          query = query.where('isUpcoming', isEqualTo: filter.isUpcoming);
        }
        if (filter.isFeatured != null) {
          query = query.where('isFeatured', isEqualTo: filter.isFeatured);
        }
        if (filter.registrationOpen != null) {
          query = query.where(
            'registrationOpen',
            isEqualTo: filter.registrationOpen,
          );
        }
        return query;
      },
    );
    return snapshot.docs
        .map((doc) => EventDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<EventRegistrationEntity> registerForEvent(String eventId) async {
    throw UnimplementedError('Registration requires user auth context');
  }

  @override
  Future<void> cancelEventRegistration(String registrationId) async {}

  @override
  Future<List<EventRegistrationEntity>> getRegisteredEvents() async {
    return [];
  }

  @override
  Future<List<EventCategoryEntity>> getCategories() async {
    return [];
  }

  @override
  Future<List<EventSpeakerEntity>> getSpeakers() async {
    return [];
  }
}
