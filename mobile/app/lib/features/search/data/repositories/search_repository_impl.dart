import '../../../../core/utils/result.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/search_filter_entity.dart';
import '../../domain/entities/recent_search_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';
import '../../domain/repositories/search_repository.dart';
import '../datasources/search_data_source.dart';

class SearchRepositoryImpl implements SearchRepository {
  final SearchDataSource dataSource;

  SearchRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<SearchResultEntity>>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  }) async {
    try {
      final res = await dataSource.searchEverything(query, filter: filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<RecentSearchEntity>>> getRecentSearches() async {
    try {
      final res = await dataSource.getRecentSearches();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> saveRecentSearch(String query) async {
    try {
      await dataSource.saveRecentSearch(query);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> deleteRecentSearch(String query) async {
    try {
      await dataSource.deleteRecentSearch(query);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> clearRecentSearches() async {
    try {
      await dataSource.clearRecentSearches();
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<SearchSuggestionEntity>>> getSearchSuggestions(
    String query,
  ) async {
    try {
      final res = await dataSource.getSearchSuggestions(query);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<String>>> getPopularSearches() async {
    try {
      final res = await dataSource.getPopularSearches();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
