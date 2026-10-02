import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/search/data/repositories/search_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_filter_entity.dart';

import '../../../../helpers/mock_search_data_source.dart';

void main() {
  late MockSearchDataSource dataSource;
  late SearchRepositoryImpl repository;

  setUp(() {
    dataSource = MockSearchDataSource(latency: Duration.zero);
    repository = SearchRepositoryImpl(dataSource);
  });

  test('searchEverything returns Result.success', () async {
    final result = await repository.searchEverything('');
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('searchEverything with query filters results', () async {
    final result = await repository.searchEverything('गुरु');
    expect(result.isSuccess, true);
    expect((result.data!.map((r) => r.id).toList()..sort()), [
      'padavali-2',
      'shahi-1',
      'shahi-2',
    ]);
  });

  test('searchEverything passes the category filter through to the data layer',
      () async {
    final result = await repository.searchEverything(
      '',
      filter: SearchFilterEntity.forCategory(SearchCategoryId.swagatGeet),
    );
    expect(result.data, hasLength(1));
    expect(result.data!.single.id, 'swagat-1');
  });

  test('getSearchSuggestions still resolves through the repository', () async {
    final result = await repository.getSearchSuggestions('गुरु');
    expect(result.isSuccess, true);
  });
}