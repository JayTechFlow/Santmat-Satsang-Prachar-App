import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/appearance_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/language_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/accessibility_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/notification_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/privacy_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/playback_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/reading_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/download_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/repositories/preference_repository.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/usecases/preference_usecases.dart';

class MockPreferenceRepository implements PreferenceRepository {
  @override
  Future<Result<UserPreferenceEntity>> getPreferences() async =>
      throw UnimplementedError();
  @override
  Future<Result<void>> updateAppearancePreference(
    AppearancePreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> updateLanguagePreference(
    LanguagePreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> updateAccessibilityPreference(
    AccessibilityPreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> updateNotificationPreference(
    NotificationPreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> updatePrivacyPreference(
    PrivacyPreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> updatePlaybackPreference(
    PlaybackPreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> updateReadingPreference(
    ReadingPreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> updateDownloadPreference(
    DownloadPreferenceEntity preference,
  ) async => const Result.success(null);
  @override
  Future<Result<void>> resetPreferences() async => const Result.success(null);
  @override
  Future<Result<String>> exportPreferences() async =>
      const Result.success('{}');
  @override
  Future<Result<void>> importPreferences(String jsonString) async =>
      const Result.success(null);
}

void main() {
  late MockPreferenceRepository repository;
  late UpdateAppearancePreferenceUseCase usecase;

  setUp(() {
    repository = MockPreferenceRepository();
    usecase = UpdateAppearancePreferenceUseCase(repository);
  });

  test('UpdateAppearancePreferenceUseCase returns success', () async {
    final result = await usecase(
      const AppearancePreferenceEntity(
        themeMode: 'dark',
        useDynamicColors: true,
        primaryColor: 'default',
      ),
    );
    expect(result.isSuccess, true);
  });
}
