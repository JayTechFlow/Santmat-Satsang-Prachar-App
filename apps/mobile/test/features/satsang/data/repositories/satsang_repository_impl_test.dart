import 'package:flutter_test/flutter_test.dart';
import '../../../../helpers/mock_satsang_data_source.dart';
import 'package:santmat_satsang_prachar/features/satsang/data/repositories/satsang_repository_impl.dart';

void main() {
  late MockSatsangDataSource dataSource;
  late SatsangRepositoryImpl repository;

  setUp(() {
    dataSource = MockSatsangDataSource();
    repository = SatsangRepositoryImpl(dataSource);
  });

  test('getLatestSatsangs returns Result.success', () async {
    final result = await repository.getLatestSatsangs();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getFeaturedSatsangs returns Result.success', () async {
    final result = await repository.getFeaturedSatsangs();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getPopularSatsangs returns Result.success', () async {
    final result = await repository.getPopularSatsangs();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });
}
