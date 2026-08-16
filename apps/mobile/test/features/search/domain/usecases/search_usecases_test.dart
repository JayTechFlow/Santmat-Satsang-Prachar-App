import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_result_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/recent_search_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_suggestion_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/repositories/search_repository.dart';
import 'package:santmat_satsang_prachar/features/search/domain/usecases/search_usecases.dart';

class MockSearchRepository implements SearchRepository {
  @override
  Future<Result<List<SearchResultEntity>>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  }) async => const Result.success([]);

  @override
  Future<Result<List<RecentSearchEntity>>> getRecentSearches() async =>
      const Result.success([]);

  @override
  Future<Result<void>> saveRecentSearch(String query) async =>
      const Result.success(null);

  @override
  Future<Result<void>> deleteRecentSearch(String query) async =>
      const Result.success(null);

  @override
  Future<Result<void>> clearRecentSearches() async =>
      const Result.success(null);

  @override
  Future<Result<List<SearchSuggestionEntity>>> getSearchSuggestions(
    String query,
  ) async => const Result.success([]);

  @override
  Future<Result<List<String>>> getPopularSearches() async =>
      const Result.success([]);
}

void main() {
  late MockSearchRepository repository;
  late SearchEverythingUseCase searchEverythingUseCase;

  setUp(() {
    repository = MockSearchRepository();
    searchEverythingUseCase = SearchEverythingUseCase(repository);
  });

  test('SearchEverythingUseCase returns success', () async {
    final result = await searchEverythingUseCase('test');
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
