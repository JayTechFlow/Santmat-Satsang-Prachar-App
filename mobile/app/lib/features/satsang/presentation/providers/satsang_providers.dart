import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/mock_satsang_data_source.dart';
import '../../data/repositories/satsang_repository_impl.dart';
import '../../domain/repositories/satsang_repository.dart';
import '../../domain/usecases/satsang_usecases.dart';
import '../../domain/entities/satsang_entity.dart';
import 'satsang_state.dart';

final mockSatsangDataSourceProvider = Provider<MockSatsangDataSource>((ref) {
  return MockSatsangDataSource();
});

final satsangRepositoryProvider = Provider<SatsangRepository>((ref) {
  return SatsangRepositoryImpl(ref.watch(mockSatsangDataSourceProvider));
});

final getLatestSatsangsUseCaseProvider = Provider<GetLatestSatsangsUseCase>((
  ref,
) {
  return GetLatestSatsangsUseCase(ref.watch(satsangRepositoryProvider));
});

final getFeaturedSatsangsUseCaseProvider = Provider<GetFeaturedSatsangsUseCase>(
  (ref) {
    return GetFeaturedSatsangsUseCase(ref.watch(satsangRepositoryProvider));
  },
);

final getPopularSatsangsUseCaseProvider = Provider<GetPopularSatsangsUseCase>((
  ref,
) {
  return GetPopularSatsangsUseCase(ref.watch(satsangRepositoryProvider));
});

final getCategoriesUseCaseProvider = Provider((ref) {
  return ref.watch(satsangRepositoryProvider).getCategories;
});

class SatsangHomeNotifier extends Notifier<SatsangHomeState> {
  @override
  SatsangHomeState build() {
    Future.microtask(loadHomeData);
    return const SatsangHomeState(isLoading: true);
  }

  Future<void> loadHomeData() async {
    state = state.copyWith(isLoading: true, error: null);

    final featuredResult = await ref.read(getFeaturedSatsangsUseCaseProvider)();
    final latestResult = await ref.read(getLatestSatsangsUseCaseProvider)();
    final popularResult = await ref.read(getPopularSatsangsUseCaseProvider)();
    final categoriesResult = await ref
        .read(satsangRepositoryProvider)
        .getCategories();

    if (featuredResult.isSuccess &&
        latestResult.isSuccess &&
        popularResult.isSuccess &&
        categoriesResult.isSuccess) {
      state = state.copyWith(
        isLoading: false,
        featuredSatsangs: featuredResult.data ?? [],
        latestSatsangs: latestResult.data ?? [],
        popularSatsangs: popularResult.data ?? [],
        categories: categoriesResult.data ?? [],
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load Satsang Home data',
      );
    }
  }
}

final satsangHomeStateProvider =
    NotifierProvider<SatsangHomeNotifier, SatsangHomeState>(() {
      return SatsangHomeNotifier();
    });

final satsangDetailsProvider = FutureProvider.family<SatsangEntity, String>((
  ref,
  id,
) async {
  final useCase = GetSatsangDetailsUseCase(
    ref.watch(satsangRepositoryProvider),
  );
  final result = await useCase(id);
  if (result.isSuccess) {
    return result.data!;
  }
  throw result.error!;
});
