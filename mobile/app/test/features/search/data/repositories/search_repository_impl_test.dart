import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/search/data/datasources/mock_search_data_source.dart';
import 'package:santmat_satsang_prachar/features/search/data/repositories/search_repository_impl.dart';

void main() {
  late MockSearchDataSource dataSource;
  late SearchRepositoryImpl repository;

  setUp(() {
    dataSource = MockSearchDataSource();
    repository = SearchRepositoryImpl(dataSource);
  });

  test('searchEverything returns Result.success', () async {
    final result = await repository.searchEverything('');
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('searchEverything with query filters results', () async {
    final result = await repository.searchEverything('Satsang');
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });
}
