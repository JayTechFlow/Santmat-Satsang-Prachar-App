import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/satsang/presentation/providers/satsang_providers.dart';
import '../../../../helpers/mock_satsang_data_source.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

void main() {
  test('SatsangHomeNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        satsangDataSourceProvider.overrideWithValue(MockSatsangDataSource()),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(satsangHomeStateProvider);
    expect(state.isLoading, true);

    await container.read(satsangHomeStateProvider.notifier).loadHomeData();
    state = container.read(satsangHomeStateProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.featuredSatsangs, isNotEmpty);
    expect(state.latestSatsangs, isNotEmpty);
    expect(state.popularSatsangs, isNotEmpty);
    expect(state.categories, isNotEmpty);
  });
}
