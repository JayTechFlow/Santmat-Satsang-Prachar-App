import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_result_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_suggestion_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/repositories/search_repository.dart';
import 'package:santmat_satsang_prachar/features/search/domain/usecases/search_usecases.dart';

/// Records what the use case forwards, so the filter actually travelling into
/// the repository is asserted rather than assumed.
class RecordingSearchRepository implements SearchRepository {
  String? lastQuery;
  SearchFilterEntity? lastFilter;
  bool failWith = false;

  @override
  Future<Result<List<SearchResultEntity>>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  }) async {
    lastQuery = query;
    lastFilter = filter;
    if (failWith) return Result.failure(Exception('boom'));
    return const Result.success([]);
  }

  @override
  Future<Result<List<SearchSuggestionEntity>>> getSearchSuggestions(
    String query,
  ) async => const Result.success([]);
}

void main() {
  late RecordingSearchRepository repository;
  late SearchEverythingUseCase searchEverythingUseCase;

  setUp(() {
    repository = RecordingSearchRepository();
    searchEverythingUseCase = SearchEverythingUseCase(repository);
  });

  test('SearchEverythingUseCase returns success', () async {
    final result = await searchEverythingUseCase('test');
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });

  test('SearchEverythingUseCase forwards the query verbatim', () async {
    await searchEverythingUseCase('गुरु');
    expect(repository.lastQuery, 'गुरु');
  });

  test('SearchEverythingUseCase forwards the category filter', () async {
    await searchEverythingUseCase(
      '',
      filter: SearchFilterEntity.forCategory(
        SearchCategoryId.shahiBhajanavali,
      ),
    );
    expect(
      repository.lastFilter?.searchCategory,
      SearchCategoryId.shahiBhajanavali,
    );
    expect(
      repository.lastFilter?.categoryDefinition?.uiLabel,
      'शाही भजनवाली',
    );
  });

  test('the ALL sentinel resolves to "no category restriction"', () {
    expect(
      SearchFilterEntity.forCategory(SearchCategoryId.allBhajan)
          .searchCategory,
      isNull,
    );
    expect(SearchFilterEntity.forCategory(null).searchCategory, isNull);
  });

  test('failures surface as a failed Result, not a throw', () async {
    repository.failWith = true;
    final result = await searchEverythingUseCase('x');
    expect(result.isSuccess, isFalse);
    expect(result.error, isNotNull);
  });
}