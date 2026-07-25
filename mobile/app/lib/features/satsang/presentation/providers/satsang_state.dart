import '../../domain/entities/satsang_entity.dart';
import '../../domain/entities/satsang_category_entity.dart';

class SatsangHomeState {
  final bool isLoading;
  final String? error;
  final List<SatsangEntity> featuredSatsangs;
  final List<SatsangEntity> latestSatsangs;
  final List<SatsangEntity> popularSatsangs;
  final List<SatsangCategoryEntity> categories;

  const SatsangHomeState({
    this.isLoading = false,
    this.error,
    this.featuredSatsangs = const [],
    this.latestSatsangs = const [],
    this.popularSatsangs = const [],
    this.categories = const [],
  });

  SatsangHomeState copyWith({
    bool? isLoading,
    String? error,
    List<SatsangEntity>? featuredSatsangs,
    List<SatsangEntity>? latestSatsangs,
    List<SatsangEntity>? popularSatsangs,
    List<SatsangCategoryEntity>? categories,
  }) {
    return SatsangHomeState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      featuredSatsangs: featuredSatsangs ?? this.featuredSatsangs,
      latestSatsangs: latestSatsangs ?? this.latestSatsangs,
      popularSatsangs: popularSatsangs ?? this.popularSatsangs,
      categories: categories ?? this.categories,
    );
  }
}
