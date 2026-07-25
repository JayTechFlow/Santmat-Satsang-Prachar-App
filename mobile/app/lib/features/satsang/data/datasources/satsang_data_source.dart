import '../../domain/entities/satsang_entity.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../domain/entities/satsang_filter_entity.dart';

abstract class SatsangDataSource {
  Future<List<SatsangEntity>> getLatestSatsangs();
  Future<List<SatsangEntity>> getFeaturedSatsangs();
  Future<List<SatsangEntity>> getPopularSatsangs();
  Future<SatsangEntity> getSatsangDetails(String id);
  Future<List<SatsangEntity>> searchSatsangs(String query);
  Future<List<SatsangEntity>> filterSatsangs(SatsangFilterEntity filter);
  Future<List<SatsangCategoryEntity>> getCategories();
}
