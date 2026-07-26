import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/preferences/presentation/providers/preferences_providers.dart';
import 'package:santmat_satsang_prachar/features/preferences/data/datasources/mock_preference_data_source.dart';

void main() {
  test('PreferencesNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        preferenceDataSourceProvider.overrideWithValue(
          MockPreferenceDataSource(),
        ),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(preferencesProvider);
    expect(state.isLoading, true);

    await container.read(preferencesProvider.notifier).loadData();
    state = container.read(preferencesProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.preferences, isNotNull);
  });
}
