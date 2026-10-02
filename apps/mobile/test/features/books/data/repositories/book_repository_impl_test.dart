import 'package:flutter_test/flutter_test.dart';
import '../../../../helpers/mock_book_data_source.dart';
import 'package:santmat_satsang_prachar/features/books/data/repositories/book_repository_impl.dart';

void main() {
  late MockBookDataSource dataSource;
  late BookRepositoryImpl repository;

  setUp(() {
    dataSource = MockBookDataSource();
    repository = BookRepositoryImpl(dataSource);
  });

  test('getLatestBooks returns Result.success', () async {
    final result = await repository.getLatestBooks();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getFeaturedBooks returns Result.success', () async {
    final result = await repository.getFeaturedBooks();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getPopularBooks returns Result.success', () async {
    final result = await repository.getPopularBooks();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getBookmarks returns Result.success', () async {
    final result = await repository.getBookmarks();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getReadingHistory returns Result.success', () async {
    final result = await repository.getReadingHistory();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });
}
