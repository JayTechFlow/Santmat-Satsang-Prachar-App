import '../../../../core/utils/result.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/appearance_preference_entity.dart';
import '../../domain/entities/language_preference_entity.dart';
import '../../domain/entities/accessibility_preference_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../../domain/entities/privacy_preference_entity.dart';
import '../../domain/entities/playback_preference_entity.dart';
import '../../domain/entities/reading_preference_entity.dart';
import '../../domain/entities/download_preference_entity.dart';
import '../../domain/repositories/preference_repository.dart';
import '../datasources/preference_data_source.dart';

class PreferenceRepositoryImpl implements PreferenceRepository {
  final PreferenceDataSource dataSource;

  PreferenceRepositoryImpl(this.dataSource);

  @override
  Future<Result<UserPreferenceEntity>> getPreferences() async {
    try {
      final res = await dataSource.getPreferences();
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updateAppearancePreference(
    AppearancePreferenceEntity pref,
  ) async {
    try {
      await dataSource.updateAppearancePreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updateLanguagePreference(
    LanguagePreferenceEntity pref,
  ) async {
    try {
      await dataSource.updateLanguagePreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updateAccessibilityPreference(
    AccessibilityPreferenceEntity pref,
  ) async {
    try {
      await dataSource.updateAccessibilityPreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updateNotificationPreference(
    NotificationPreferenceEntity pref,
  ) async {
    try {
      await dataSource.updateNotificationPreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updatePrivacyPreference(
    PrivacyPreferenceEntity pref,
  ) async {
    try {
      await dataSource.updatePrivacyPreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updatePlaybackPreference(
    PlaybackPreferenceEntity pref,
  ) async {
    try {
      await dataSource.updatePlaybackPreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updateReadingPreference(
    ReadingPreferenceEntity pref,
  ) async {
    try {
      await dataSource.updateReadingPreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> updateDownloadPreference(
    DownloadPreferenceEntity pref,
  ) async {
    try {
      await dataSource.updateDownloadPreference(pref);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> resetPreferences() async {
    try {
      await dataSource.resetPreferences();
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<String>> exportPreferences() async {
    try {
      final res = await dataSource.exportPreferences();
      return Result.success(res);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<void>> importPreferences(String jsonString) async {
    try {
      await dataSource.importPreferences(jsonString);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }
}
