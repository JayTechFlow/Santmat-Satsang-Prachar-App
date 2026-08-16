import '../../../core/cache/manager/cache_manager.dart';
import '../../../core/cache/models/cache_policy.dart';
import '../data/models/recommendation_dto.dart';
import '../domain/entities/recommendation_entity.dart';

class OfflineRecommendationsCache {
  final CacheManager cacheManager;
  static const String cacheKey = 'offline_recommendations_v1';
  static const Duration defaultTtl = Duration(hours: 12);

  OfflineRecommendationsCache(this.cacheManager);

  Future<void> cacheRecommendations(List<RecommendationEntity> items) async {
    final dtos = items.map((e) => RecommendationDto.fromEntity(e).toJson()).toList();
    await cacheManager.put<List<dynamic>>(cacheKey, dtos, ttl: defaultTtl);
  }

  Future<List<RecommendationEntity>?> getCachedRecommendations({
    CachePolicy policy = CachePolicy.cacheFirst,
  }) async {
    final cached = await cacheManager.get<List<dynamic>>(cacheKey, policy: policy);
    if (cached == null) return null;

    try {
      final list = cached
          .cast<Map<String, dynamic>>()
          .map((json) => RecommendationDto.fromJson(json).toEntity())
          .toList();
      return list;
    } catch (_) {
      return null;
    }
  }

  Future<void> clearCache() async {
    await cacheManager.remove(cacheKey);
  }
}
