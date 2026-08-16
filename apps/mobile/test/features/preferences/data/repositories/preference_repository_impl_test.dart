import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/preferences/data/datasources/mock_preference_data_source.dart';
import 'package:santmat_satsang_prachar/features/preferences/data/repositories/preference_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/appearance_preference_entity.dart';

void main() {
  late MockPreferenceDataSource dataSource;
  late PreferenceRepositoryImpl repository;

  setUp(() {
    dataSource = MockPreferenceDataSource();
    repository = PreferenceRepositoryImpl(dataSource);
  });

  test('getPreferences returns Result.success', () async {
    final result = await repository.getPreferences();
    expect(result.isSuccess, true);
    expect(result.data, isNotNull);
  });

  test('updateAppearancePreference works properly', () async {
    final res = await repository.updateAppearancePreference(
      const AppearancePreferenceEntity(
        themeMode: 'dark',
        useDynamicColors: false,
        primaryColor: '',
      ),
    );
    expect(res.isSuccess, true);

    final updated = await repository.getPreferences();
    expect(updated.data!.appearance.themeMode, 'dark');
  });
}
