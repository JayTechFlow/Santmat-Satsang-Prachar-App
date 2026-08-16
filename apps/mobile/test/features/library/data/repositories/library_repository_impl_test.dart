import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/library/data/datasources/mock_library_data_source.dart';
import 'package:santmat_satsang_prachar/features/library/data/repositories/library_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/library/domain/entities/library_filter_entity.dart';

void main() {
  late MockLibraryDataSource dataSource;
  late LibraryRepositoryImpl repository;

  setUp(() {
    dataSource = MockLibraryDataSource();
    repository = LibraryRepositoryImpl(dataSource);
  });

  test('getBookmarks returns Result.success', () async {
    final result = await repository.getBookmarks(const LibraryFilterEntity());
    expect(result.isSuccess, true);
    expect(result.data, isNotNull);
  });

  test('toggleFavorite toggles properly', () async {
    final res = await repository.toggleFavorite('cid_0', 'audio');
    expect(res.isSuccess, true);
  });
}
