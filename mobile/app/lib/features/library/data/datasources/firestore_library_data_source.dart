import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/bookmark_entity.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/entities/history_entity.dart';
import '../../domain/entities/recent_activity_entity.dart';
import '../../domain/entities/library_filter_entity.dart';
import '../models/library_dto.dart';
import 'library_data_source.dart';

class FirestoreLibraryDataSource implements LibraryDataSource {
  final FirestoreService _firestoreService;
  final FirebaseAuth _firebaseAuth;

  FirestoreLibraryDataSource(
    this._firestoreService, {
    FirebaseAuth? firebaseAuth,
  }) : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  String get _userId => _firebaseAuth.currentUser?.uid ?? '';

  String get _libraryPath =>
      '${FirestoreCollections.users}/$_userId/${FirestoreCollections.library}';

  @override
  Future<List<BookmarkEntity>> getBookmarks(LibraryFilterEntity filter) async {
    if (_userId.isEmpty) return [];
    final snapshot = await _firestoreService.getCollection(_libraryPath);
    var bookmarks = snapshot.docs
        .where(
          (doc) => (doc.data() as Map<String, dynamic>).containsKey(
            'bookmarkedDate',
          ),
        )
        .map((doc) => BookmarkDto.fromFirestore(doc))
        .toList();
    if (filter.contentType != null) {
      bookmarks = bookmarks
          .where((b) => b.item.contentType == filter.contentType)
          .toList();
    }
    return bookmarks;
  }

  @override
  Future<List<FavoriteEntity>> getFavorites(LibraryFilterEntity filter) async {
    if (_userId.isEmpty) return [];
    final snapshot = await _firestoreService.getCollection(_libraryPath);
    var favorites = snapshot.docs
        .where(
          (doc) =>
              (doc.data() as Map<String, dynamic>).containsKey('favoritedDate'),
        )
        .map((doc) => FavoriteDto.fromFirestore(doc))
        .toList();
    if (filter.contentType != null) {
      favorites = favorites
          .where((f) => f.item.contentType == filter.contentType)
          .toList();
    }
    return favorites;
  }

  @override
  Future<List<HistoryEntity>> getHistory(LibraryFilterEntity filter) async {
    if (_userId.isEmpty) return [];
    final snapshot = await _firestoreService.getCollection(_libraryPath);
    var history = snapshot.docs
        .where(
          (doc) =>
              (doc.data() as Map<String, dynamic>).containsKey('accessedDate'),
        )
        .map((doc) => HistoryDto.fromFirestore(doc))
        .toList();
    if (filter.contentType != null) {
      history = history
          .where((h) => h.item.contentType == filter.contentType)
          .toList();
    }
    history.sort((a, b) => b.accessedDate.compareTo(a.accessedDate));
    return history;
  }

  @override
  Future<List<RecentActivityEntity>> getRecentActivities() async {
    if (_userId.isEmpty) return [];
    final history = await getHistory(const LibraryFilterEntity());
    return history
        .take(5)
        .map(
          (h) => RecentActivityDto(
            id: h.id,
            item: h.item,
            activityDate: h.accessedDate,
            activityType: h.item.contentType == 'book'
                ? 'read'
                : (h.item.contentType == 'audio' ? 'listened' : 'viewed'),
          ),
        )
        .toList();
  }

  @override
  Future<void> addBookmark(String contentId, String contentType) async {
    final docId = '${contentId}_$contentType';
    await _firestoreService.setDocument(_libraryPath, docId, {
      'contentId': contentId,
      'contentType': contentType,
      'bookmarkedDate': FieldValue.serverTimestamp(),
      'title': 'Mock Title', // Placeholder until real item fetched
      'subtitle': 'Mock Subtitle',
      'thumbnail': '',
      'category': 'Unknown',
      'createdDate': FieldValue.serverTimestamp(),
      'sourceModule': contentType,
      'route': '',
    }, merge: true);
  }

  @override
  Future<void> removeBookmark(String contentId, String contentType) async {
    final docId = '${contentId}_$contentType';
    await _firestoreService.updateDocument(_libraryPath, docId, {
      'bookmarkedDate': FieldValue.delete(),
    });
  }

  @override
  Future<void> toggleFavorite(String contentId, String contentType) async {
    final docId = '${contentId}_$contentType';
    try {
      final doc = await _firestoreService.getDocument(_libraryPath, docId);
      final data = doc.data() as Map<String, dynamic>?;
      if (data != null && data.containsKey('favoritedDate')) {
        await _firestoreService.updateDocument(_libraryPath, docId, {
          'favoritedDate': FieldValue.delete(),
        });
      } else {
        await _firestoreService.setDocument(_libraryPath, docId, {
          'contentId': contentId,
          'contentType': contentType,
          'favoritedDate': FieldValue.serverTimestamp(),
          'title': 'Mock Title',
          'subtitle': 'Mock Subtitle',
          'thumbnail': '',
          'category': 'Unknown',
          'createdDate': FieldValue.serverTimestamp(),
          'sourceModule': contentType,
          'route': '',
        }, merge: true);
      }
    } catch (e) {
      await _firestoreService.setDocument(_libraryPath, docId, {
        'contentId': contentId,
        'contentType': contentType,
        'favoritedDate': FieldValue.serverTimestamp(),
        'title': 'Mock Title',
        'subtitle': 'Mock Subtitle',
        'thumbnail': '',
        'category': 'Unknown',
        'createdDate': FieldValue.serverTimestamp(),
        'sourceModule': contentType,
        'route': '',
      }, merge: true);
    }
  }

  @override
  Future<void> addHistoryItem(
    String contentId,
    String contentType,
    double? progress,
  ) async {
    final docId = '${contentId}_$contentType';
    await _firestoreService.setDocument(_libraryPath, docId, {
      'contentId': contentId,
      'contentType': contentType,
      'accessedDate': FieldValue.serverTimestamp(),
      'sessionProgress': progress,
      'title': 'Mock Title',
      'subtitle': 'Mock Subtitle',
      'thumbnail': '',
      'category': 'Unknown',
      'createdDate': FieldValue.serverTimestamp(),
      'sourceModule': contentType,
      'route': '',
    }, merge: true);
  }

  @override
  Future<void> deleteHistoryItem(String historyId) async {
    // Here historyId is docId
    await _firestoreService.updateDocument(_libraryPath, historyId, {
      'accessedDate': FieldValue.delete(),
      'sessionProgress': FieldValue.delete(),
    });
  }

  @override
  Future<void> clearHistory() async {
    final snapshot = await _firestoreService.getCollection(_libraryPath);
    for (var doc in snapshot.docs) {
      if ((doc.data() as Map<String, dynamic>).containsKey('accessedDate')) {
        await _firestoreService.updateDocument(_libraryPath, doc.id, {
          'accessedDate': FieldValue.delete(),
          'sessionProgress': FieldValue.delete(),
        });
      }
    }
  }
}
