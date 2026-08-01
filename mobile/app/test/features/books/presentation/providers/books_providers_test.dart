import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/books/presentation/providers/books_providers.dart';
import 'package:santmat_satsang_prachar/features/books/data/datasources/mock_book_data_source.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

void main() {
  test('BooksHomeNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        bookDataSourceProvider.overrideWithValue(MockBookDataSource()),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(booksHomeStateProvider);
    expect(state.isLoading, true);

    await container.read(booksHomeStateProvider.notifier).loadHomeData();
    state = container.read(booksHomeStateProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.featuredBooks, isNotEmpty);
    expect(state.latestBooks, isNotEmpty);
    expect(state.popularBooks, isNotEmpty);
    expect(state.categories, isNotEmpty);
    expect(state.readingHistory, isNotEmpty);
  });
}
