import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/services/firestore_service.dart';
import '../../../../core/utils/fetch_all_pages.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/audio_filter_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';
import '../../../search/domain/entities/search_category_definition.dart';
import '../models/audio_dto.dart';
import 'audio_data_source.dart';

class FirestoreAudioDataSource implements AudioDataSource {
  final FirestoreService _firestoreService;
  final FirebaseAuth _firebaseAuth;

  FirestoreAudioDataSource(this._firestoreService, {FirebaseAuth? firebaseAuth})
    : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  String get _userId => _firebaseAuth.currentUser?.uid ?? '';

  /// Page size of a single Firestore request when loading the published
  /// catalogue. Individual pages stay small; [fetchAllPages] walks every page
  /// so the song lists and category filters are never truncated at the first
  /// page (regression: a hard `limit(10)` hid 40 of 50 published tracks).
  static const int cataloguePageSize = 30;

  /// The complete published catalogue, newest first.
  ///
  /// Song-list screens render this list and apply category/search filtering
  /// client-side, so every eligible published document must be fetched —
  /// across all pages, not just the first one.
  @override
  Future<List<AudioEntity>> getLatestAudio() async {
    final docs = await fetchAllPages<
      QueryDocumentSnapshot<Map<String, dynamic>>,
      QueryDocumentSnapshot<Map<String, dynamic>>
    >(
      pageSize: cataloguePageSize,
      fetchPage: (cursor) async {
        Query<Map<String, dynamic>> page = FirebaseFirestore.instance
            .collection(FirestoreCollections.audio)
            .where('status', isEqualTo: 'प्रकाशित')
            .orderBy('createdAt', descending: true)
            .limit(cataloguePageSize);
        if (cursor != null) {
          page = page.startAfterDocument(cursor);
        }
        final snapshot = await page.get();
        return FetchPage(
          items: snapshot.docs,
          nextCursor: snapshot.docs.isEmpty ? null : snapshot.docs.last,
        );
      },
    );

    return distinctBy(
      docs.map((doc) => AudioDto.fromFirestore(doc).toEntity()),
      (audio) => audio.id,
    );
  }

  @override
  Future<List<AudioEntity>> getFeaturedAudio() async {
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.audio)
        .where('status', isEqualTo: 'प्रकाशित')
        .limit(5)
        .get();

    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<AudioEntity>> getPopularAudio() async {
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.audio)
        .where('status', isEqualTo: 'प्रकाशित')
        .limit(10)
        .get();

    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<AudioEntity> getAudioDetails(String id) async {
    final doc = await _firestoreService.getDocument(
      FirestoreCollections.audio,
      id,
    );
    if (!doc.exists) {
      throw Exception('Audio not found');
    }
    return AudioDto.fromFirestore(doc).toEntity();
  }

  @override
  Future<List<AudioEntity>> searchAudio(String query) async {
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.audio)
        .where('status', isEqualTo: 'प्रकाशित')
        .get();
    final q = query.toLowerCase();

    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc).toEntity())
        .where(
          (a) =>
              a.title.toLowerCase().contains(q) ||
              a.speaker.toLowerCase().contains(q),
        )
        .toList();
  }

  @override
  Future<List<AudioEntity>> filterAudio(AudioFilterEntity filter) async {
    Query query = FirebaseFirestore.instance
        .collection(FirestoreCollections.audio)
        .where('status', isEqualTo: 'प्रकाशित');

    if (filter.categoryId != null) {
      query = query.where('categoryId', isEqualTo: filter.categoryId);
    }
    if (filter.speaker != null) {
      query = query.where('speaker', isEqualTo: filter.speaker);
    }
    if (filter.language != null) {
      query = query.where('language', isEqualTo: filter.language);
    }
    final snapshot = await query.get();
    var results = snapshot.docs
        .map(
          (doc) => AudioDto.fromFirestore(doc as DocumentSnapshot).toEntity(),
        )
        .toList();

    if (filter.searchQuery != null) {
      final q = filter.searchQuery!.toLowerCase();
      results = results
          .where(
            (a) =>
                a.title.toLowerCase().contains(q) ||
                a.speaker.toLowerCase().contains(q),
          )
          .toList();
    }

    return results;
  }

  @override
  Future<List<AudioCategoryEntity>> getCategories() async {
    // The mobile category row is a fixed product contract (the four permanent
    // system categories in [SearchCategories]). The Admin `categories`
    // collection is a web-only concern and may contain legacy values such as
    // `general`, which must never surface as a fifth mobile category.
    return SearchCategories.audioCategories;
  }

  @override
  Future<List<FavoriteAudioEntity>> getFavorites() async {
    if (_userId.isEmpty) return [];
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.users)
        .doc(_userId)
        .collection('favorite_audios')
        .get();

    if (snapshot.docs.isEmpty) return [];

    List<FavoriteAudioEntity> favorites = [];

    for (int i = 0; i < snapshot.docs.length; i += 30) {
      final batchDocs = snapshot.docs.sublist(
        i,
        i + 30 > snapshot.docs.length ? snapshot.docs.length : i + 30,
      );

      final ids = batchDocs.map((d) => d.id).toList();

      final audioSnapshot = await FirebaseFirestore.instance
          .collection(FirestoreCollections.audio)
          .where(FieldPath.documentId, whereIn: ids)
          .get();

      final audioDocsMap = {for (var doc in audioSnapshot.docs) doc.id: doc};

      for (var doc in batchDocs) {
        if (audioDocsMap.containsKey(doc.id)) {
          final audio = AudioDto.fromFirestore(
            audioDocsMap[doc.id]!,
          ).toEntity();
          final favoritedAt =
              (doc.data()['favoritedAt'] as Timestamp?)?.toDate() ??
              DateTime.now();
          favorites.add(
            FavoriteAudioEntity(audio: audio, favoritedAt: favoritedAt),
          );
        }
      }
    }

    return favorites;
  }

  @override
  Future<bool> toggleFavoriteAudio(String id) async {
    if (_userId.isEmpty) return false;
    final docRef = FirebaseFirestore.instance
        .collection(FirestoreCollections.users)
        .doc(_userId)
        .collection('favorite_audios')
        .doc(id);

    final doc = await docRef.get();
    if (doc.exists) {
      await docRef.delete();
      return false;
    } else {
      await docRef.set({'favoritedAt': FieldValue.serverTimestamp()});
      return true;
    }
  }

  @override
  Future<List<RecentlyPlayedEntity>> getRecentlyPlayed() async {
    if (_userId.isEmpty) return [];
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.users)
        .doc(_userId)
        .collection('recently_played_audios')
        .orderBy('playedAt', descending: true)
        .limit(10)
        .get();

    if (snapshot.docs.isEmpty) return [];

    final ids = snapshot.docs
        .map((d) => d.data()['audioId'] as String?)
        .where((id) => id != null)
        .cast<String>()
        .toSet()
        .toList();

    if (ids.isEmpty) return [];

    List<RecentlyPlayedEntity> recents = [];

    // limit is 10, so a single whereIn is safe
    final audioSnapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.audio)
        .where(FieldPath.documentId, whereIn: ids)
        .get();

    final audioDocsMap = {for (var doc in audioSnapshot.docs) doc.id: doc};

    for (var doc in snapshot.docs) {
      final audioId = doc.data()['audioId'] as String?;
      if (audioId != null && audioDocsMap.containsKey(audioId)) {
        final audio = AudioDto.fromFirestore(audioDocsMap[audioId]!).toEntity();
        final playedAt =
            (doc.data()['playedAt'] as Timestamp?)?.toDate() ?? DateTime.now();
        recents.add(RecentlyPlayedEntity(audio: audio, playedAt: playedAt));
      }
    }
    return recents;
  }
}
