import '../../../../core/utils/result.dart';
import '../entities/recommendation_entity.dart';
import '../repositories/recommendation_repository.dart';

class GetRecommendationsUseCase {
  final IRecommendationRepository repository;

  GetRecommendationsUseCase(this.repository);

  Future<Result<List<RecommendationEntity>>> call({
    String? category,
    RecommendationType? type,
    bool forceRefresh = false,
  }) async {
    return repository.getRecommendations(
      category: category,
      type: type,
      forceRefresh: forceRefresh,
    );
  }
}
