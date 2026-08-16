import '../../../../core/utils/result.dart';
import '../entities/recommendation_entity.dart';

abstract class IRecommendationRepository {
  Future<Result<List<RecommendationEntity>>> getRecommendations({
    String? category,
    RecommendationType? type,
    bool forceRefresh = false,
  });

  Future<Result<void>> cacheRecommendations(
    List<RecommendationEntity> recommendations,
  );

  Future<Result<List<RecommendationEntity>>> getOfflineRecommendations();
}
