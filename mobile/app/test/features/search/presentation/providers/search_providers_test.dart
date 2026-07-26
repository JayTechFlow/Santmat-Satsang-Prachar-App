import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/search/presentation/providers/search_providers.dart';
import 'package:santmat_satsang_prachar/features/search/data/datasources/mock_search_data_source.dart';

void main() {
  test('SearchNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        searchDataSourceProvider.overrideWithValue(MockSearchDataSource()),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(searchProvider);
    expect(state.isLoading, false);

    await container.read(searchProvider.notifier).performSearch('Satsang');
    state = container.read(searchProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.results, isNotEmpty);
  });
}
