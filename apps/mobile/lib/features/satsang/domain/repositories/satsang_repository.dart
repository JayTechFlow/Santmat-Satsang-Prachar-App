import '../../../../core/utils/result.dart';
import '../entities/satsang_entity.dart';
import '../entities/satsang_filter_entity.dart';
import '../entities/satsang_category_entity.dart';

abstract class SatsangRepository {
  Future<Result<List<SatsangEntity>>> getLatestSatsangs();
  Future<Result<List<SatsangEntity>>> getFeaturedSatsangs();
  Future<Result<List<SatsangEntity>>> getPopularSatsangs();
  Future<Result<SatsangEntity>> getSatsangDetails(String id);
  Future<Result<List<SatsangEntity>>> searchSatsangs(String query);
  Future<Result<List<SatsangEntity>>> filterSatsangs(
    SatsangFilterEntity filter,
  );
  Future<Result<List<SatsangCategoryEntity>>> getCategories();
}
