import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/cache/manager/cache_manager.dart';
import '../../../../core/di/service_locator_registrations.dart';
import '../../data/datasources/recommendation_datasource.dart';
import '../../data/repositories/recommendation_repository_impl.dart';
import '../../domain/entities/recommendation_entity.dart';
import '../../domain/repositories/recommendation_repository.dart';
import '../../domain/usecases/recommendation_usecases.dart';
import '../../offline/offline_recommendations_cache.dart';

final offlineRecommendationsCacheProvider = Provider<OfflineRecommendationsCache>((ref) {
  final cacheManager = InMemoryCacheManager();
  return OfflineRecommendationsCache(cacheManager);
});

final recommendationDataSourceProvider = Provider<RecommendationDataSource>((ref) {
  return FirestoreRecommendationDataSource(ref.watch(firestoreServiceProvider));
});

final recommendationRepositoryProvider = Provider<IRecommendationRepository>((ref) {
  return RecommendationRepositoryImpl(
    ref.watch(recommendationDataSourceProvider),
    ref.watch(offlineRecommendationsCacheProvider),
  );
});

final getRecommendationsUseCaseProvider = Provider<GetRecommendationsUseCase>((ref) {
  return GetRecommendationsUseCase(ref.watch(recommendationRepositoryProvider));
});

class RecommendationState {
  final bool isLoading;
  final String? error;
  final List<RecommendationEntity> recommendations;

  const RecommendationState({
    this.isLoading = false,
    this.error,
    this.recommendations = const [],
  });

  RecommendationState copyWith({
    bool? isLoading,
    String? error,
    List<RecommendationEntity>? recommendations,
  }) {
    return RecommendationState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      recommendations: recommendations ?? this.recommendations,
    );
  }
}

class RecommendationNotifier extends Notifier<RecommendationState> {
  bool _mounted = true;

  @override
  RecommendationState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadRecommendations();
    });
    return const RecommendationState(isLoading: true);
  }

  Future<void> loadRecommendations({bool forceRefresh = false}) async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    final useCase = ref.read(getRecommendationsUseCaseProvider);
    final result = await useCase(forceRefresh: forceRefresh);

    if (!_mounted) return;

    if (result.isSuccess) {
      state = state.copyWith(
        isLoading: false,
        recommendations: result.data ?? [],
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        error: result.error?.toString(),
      );
    }
  }
}

final recommendationNotifierProvider =
    NotifierProvider<RecommendationNotifier, RecommendationState>(RecommendationNotifier.new);
