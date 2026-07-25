import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/home/data/datasources/mock_home_data_source.dart';
import 'package:santmat_satsang_prachar/features/home/data/repositories/home_repository_impl.dart';

void main() {
  late MockHomeDataSource dataSource;
  late HomeRepositoryImpl repository;

  setUp(() {
    dataSource = MockHomeDataSource();
    repository = HomeRepositoryImpl(dataSource);
  });

  test('should return success result with data', () async {
    final result = await repository.getHomeDashboard();
    expect(result.isSuccess, isTrue);

    result.when(
      success: (data) {
        expect(data.banners.length, 2);
        expect(data.quickActions.length, 4);
      },
      failure: (_) => fail('Should be success'),
    );
  });
}
