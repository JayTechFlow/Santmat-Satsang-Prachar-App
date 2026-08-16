import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/satsang/domain/entities/satsang_entity.dart';
import 'package:santmat_satsang_prachar/features/satsang/domain/entities/satsang_category_entity.dart';
import 'package:santmat_satsang_prachar/features/satsang/domain/entities/satsang_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/satsang/domain/repositories/satsang_repository.dart';
import 'package:santmat_satsang_prachar/features/satsang/domain/usecases/satsang_usecases.dart';

class MockSatsangRepository implements SatsangRepository {
  @override
  Future<Result<List<SatsangEntity>>> getLatestSatsangs() async =>
      const Result.success([]);

  @override
  Future<Result<List<SatsangEntity>>> getFeaturedSatsangs() async =>
      const Result.success([]);

  @override
  Future<Result<List<SatsangEntity>>> getPopularSatsangs() async =>
      const Result.success([]);

  @override
  Future<Result<SatsangEntity>> getSatsangDetails(String id) async =>
      throw UnimplementedError();

  @override
  Future<Result<List<SatsangEntity>>> searchSatsangs(String query) async =>
      const Result.success([]);

  @override
  Future<Result<List<SatsangEntity>>> filterSatsangs(
    SatsangFilterEntity filter,
  ) async => const Result.success([]);

  @override
  Future<Result<List<SatsangCategoryEntity>>> getCategories() async =>
      const Result.success([]);
}

void main() {
  late MockSatsangRepository repository;
  late GetLatestSatsangsUseCase getLatestUseCase;
  late GetFeaturedSatsangsUseCase getFeaturedUseCase;

  setUp(() {
    repository = MockSatsangRepository();
    getLatestUseCase = GetLatestSatsangsUseCase(repository);
    getFeaturedUseCase = GetFeaturedSatsangsUseCase(repository);
  });

  test('GetLatestSatsangsUseCase returns success', () async {
    final result = await getLatestUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });

  test('GetFeaturedSatsangsUseCase returns success', () async {
    final result = await getFeaturedUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
