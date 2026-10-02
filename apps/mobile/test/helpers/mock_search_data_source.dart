import 'package:santmat_satsang_prachar/core/services/firestore_service.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/search/data/datasources/firestore_search_data_source.dart';
import 'package:santmat_satsang_prachar/features/search/data/datasources/search_data_source.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_result_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_suggestion_entity.dart';

import 'search_fixtures.dart';

/// In-memory [SearchDataSource] for tests.
///
/// It deliberately delegates to the *real* `FirestoreSearchDataSource` search
/// pipeline, so category filtering, Unicode matching, ranking and de-duplication
/// are exercised for real rather than faked. Only the Firestore read is stubbed
/// with the published-bhajan fixtures.
class MockSearchDataSource implements SearchDataSource {
  final List<AudioEntity> _publishedBhajans;
  final FirestoreSearchDataSource _pipeline;

  /// Artificial latency so loading states are observable.
  Duration latency;

  MockSearchDataSource({
    List<AudioEntity>? publishedBhajans,
    this.latency = const Duration(milliseconds: 500),
  })  : _publishedBhajans = List.of(
          publishedBhajans ?? searchPublishedBhajans,
        ),
        _pipeline = FirestoreSearchDataSource(FirestoreService(firestore: null));

  @override
  Future<List<SearchResultEntity>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  }) async {
    if (latency > Duration.zero) {
      await Future<void>.delayed(latency);
    }
    return _pipeline.searchPublishedAudio(
      _publishedBhajans,
      query: query,
      category: filter?.categoryDefinition,
    );
  }

  @override
  Future<List<SearchSuggestionEntity>> getSearchSuggestions(
    String query,
  ) async {
    final results = await searchEverything(query);
    final q = query.toLowerCase();
    return results
        .where((item) => item.title.toLowerCase().contains(q))
        .map((item) => SearchSuggestionEntity(suggestion: item.title))
        .take(5)
        .toList();
  }
}