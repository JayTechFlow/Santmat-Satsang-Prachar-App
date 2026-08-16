import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../../../core/services/cloud_functions_service.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/recent_search_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';
import '../../domain/entities/search_filter_entity.dart';
import '../models/search_result_dto.dart';
import 'search_data_source.dart';

class FirestoreSearchDataSource implements SearchDataSource {
  final FirestoreService _firestoreService;
  final CloudFunctionsService _cloudFunctionsService;
  final FirebaseAuth _firebaseAuth;

  FirestoreSearchDataSource(
    this._firestoreService,
    this._cloudFunctionsService, {
    FirebaseAuth? firebaseAuth,
  }) : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  String get _userId => _firebaseAuth.currentUser?.uid ?? '';

  @override
  Future<List<SearchResultEntity>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  }) async {
    // In a real app, you would use Algolia or Typesense.
    // For now we just query Firestore collection and filter client-side.
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.searchIndex,
    );
    final q = query.toLowerCase();

    var results = snapshot.docs
        .map((doc) => SearchResultDto.fromFirestore(doc))
        .where((item) {
          if (q.isNotEmpty) {
            final matchTitle = item.title.toLowerCase().contains(q);
            final matchSubtitle = item.subtitle.toLowerCase().contains(q);
            final matchTags = item.tags.any((t) => t.toLowerCase().contains(q));
            if (!matchTitle && !matchSubtitle && !matchTags) return false;
          }

          if (filter != null) {
            if (filter.contentTypes != null &&
                filter.contentTypes!.isNotEmpty) {
              if (!filter.contentTypes!.contains(item.type)) return false;
            }
          }
          return true;
        })
        .toList();

    return results;
  }

  @override
  Future<List<RecentSearchEntity>> getRecentSearches() async {
    final path = '${FirestoreCollections.users}/$_userId/recent_searches';
    final snapshot = await _firestoreService.getCollection(path);
    var searches = snapshot.docs
        .map((doc) => RecentSearchDto.fromFirestore(doc))
        .toList();
    searches.sort((a, b) => b.searchedAt.compareTo(a.searchedAt));
    return searches;
  }

  @override
  Future<void> saveRecentSearch(String query) async {
    final q = query.trim();
    if (q.isEmpty) return;
    final path = '${FirestoreCollections.users}/$_userId/recent_searches';
    final docId = q.toLowerCase().replaceAll(' ', '_');

    await _firestoreService.setDocument(path, docId, {
      'query': q,
      'searchedAt': FieldValue.serverTimestamp(),
    }, merge: true);
  }

  @override
  Future<void> deleteRecentSearch(String query) async {
    final docId = query.toLowerCase().replaceAll(' ', '_');
    final path = '${FirestoreCollections.users}/$_userId/recent_searches';
    await _firestoreService.deleteDocument(path, docId);
  }

  @override
  Future<void> clearRecentSearches() async {
    final path = '${FirestoreCollections.users}/$_userId/recent_searches';
    final snapshot = await _firestoreService.getCollection(path);
    for (var doc in snapshot.docs) {
      await _firestoreService.deleteDocument(path, doc.id);
    }
  }

  @override
  Future<List<SearchSuggestionEntity>> getSearchSuggestions(
    String query,
  ) async {
    final results = await searchEverything(query);
    final q = query.toLowerCase();
    return results
        .where((item) => item.title.toLowerCase().contains(q))
        .map((item) => SearchSuggestionDto(suggestion: item.title))
        .take(5)
        .toList();
  }

  @override
  Future<List<String>> getPopularSearches() async {
    try {
      final response = await _cloudFunctionsService.callFunction('trendingSearches');
      if (response['status'] == 'success') {
        final List<dynamic> data = response['data'] ?? [];
        return data.map((e) => e.toString()).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
