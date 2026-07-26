import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/library/presentation/providers/library_providers.dart';
import 'package:santmat_satsang_prachar/features/library/data/datasources/mock_library_data_source.dart';

void main() {
  test('LibraryNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        libraryDataSourceProvider.overrideWithValue(MockLibraryDataSource()),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(libraryProvider);
    expect(state.isLoading, true);

    await container.read(libraryProvider.notifier).loadData();
    state = container.read(libraryProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.bookmarks, isNotEmpty);
    expect(state.favorites, isNotEmpty);
    expect(state.history, isNotEmpty);
    expect(state.recentActivities, isNotEmpty);
  });
}
