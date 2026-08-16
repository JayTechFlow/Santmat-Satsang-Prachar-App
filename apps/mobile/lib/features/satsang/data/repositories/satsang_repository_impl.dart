import '../../../../core/utils/result.dart';
import '../../domain/entities/satsang_entity.dart';
import '../../domain/entities/satsang_filter_entity.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../domain/repositories/satsang_repository.dart';
import '../datasources/satsang_data_source.dart';

class SatsangRepositoryImpl implements SatsangRepository {
  final SatsangDataSource _dataSource;

  SatsangRepositoryImpl(this._dataSource);

  @override
  Future<Result<List<SatsangEntity>>> getLatestSatsangs() async {
    try {
      final result = await _dataSource.getLatestSatsangs();
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<SatsangEntity>>> getFeaturedSatsangs() async {
    try {
      final result = await _dataSource.getFeaturedSatsangs();
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<SatsangEntity>>> getPopularSatsangs() async {
    try {
      final result = await _dataSource.getPopularSatsangs();
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<SatsangEntity>> getSatsangDetails(String id) async {
    try {
      final result = await _dataSource.getSatsangDetails(id);
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<SatsangEntity>>> searchSatsangs(String query) async {
    try {
      final result = await _dataSource.searchSatsangs(query);
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<SatsangEntity>>> filterSatsangs(
    SatsangFilterEntity filter,
  ) async {
    try {
      final result = await _dataSource.filterSatsangs(filter);
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<SatsangCategoryEntity>>> getCategories() async {
    try {
      final result = await _dataSource.getCategories();
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
