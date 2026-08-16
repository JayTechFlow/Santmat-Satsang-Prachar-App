import '../../../../core/utils/result.dart';
import '../../domain/entities/recommendation_entity.dart';
import '../../domain/repositories/recommendation_repository.dart';
import '../../offline/offline_recommendations_cache.dart';
import '../datasources/recommendation_datasource.dart';

class RecommendationRepositoryImpl implements IRecommendationRepository {
  final RecommendationDataSource dataSource;
  final OfflineRecommendationsCache offlineCache;

  RecommendationRepositoryImpl(this.dataSource, this.offlineCache);

  @override
  Future<Result<List<RecommendationEntity>>> getRecommendations({
    String? category,
    RecommendationType? type,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh) {
      final cached = await offlineCache.getCachedRecommendations();
      if (cached != null && cached.isNotEmpty) {
        var items = cached;
        if (category != null && category.isNotEmpty) {
          items = items.where((i) => i.category.toLowerCase() == category.toLowerCase()).toList();
        }
        if (type != null) {
          items = items.where((i) => i.type == type).toList();
        }
        if (items.isNotEmpty) {
          return Result.success(items);
        }
      }
    }

    try {
      final dtos = await dataSource.getRecommendations(
        category: category,
        type: type?.name,
      );
      final entities = dtos.map((d) => d.toEntity()).toList();
      await offlineCache.cacheRecommendations(entities);
      return Result.success(entities);
    } catch (e) {
      final cachedFallback = await offlineCache.getCachedRecommendations();
      if (cachedFallback != null && cachedFallback.isNotEmpty) {
        return Result.success(cachedFallback);
      }
      return Result.failure(Exception('Failed to fetch recommendations: $e'));
    }
  }

  @override
  Future<Result<void>> cacheRecommendations(
    List<RecommendationEntity> recommendations,
  ) async {
    try {
      await offlineCache.cacheRecommendations(recommendations);
      return Result.success(null);
    } catch (e) {
      return Result.failure(Exception('Failed to cache recommendations: $e'));
    }
  }

  @override
  Future<Result<List<RecommendationEntity>>> getOfflineRecommendations() async {
    try {
      final cached = await offlineCache.getCachedRecommendations();
      return Result.success(cached ?? []);
    } catch (e) {
      return Result.failure(Exception('Failed to load offline recommendations: $e'));
    }
  }
}
