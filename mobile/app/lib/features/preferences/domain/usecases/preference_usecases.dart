import '../../../../core/utils/result.dart';
import '../entities/user_preference_entity.dart';
import '../entities/appearance_preference_entity.dart';
import '../entities/language_preference_entity.dart';
import '../entities/accessibility_preference_entity.dart';
import '../entities/notification_preference_entity.dart';
import '../entities/privacy_preference_entity.dart';
import '../entities/playback_preference_entity.dart';
import '../entities/reading_preference_entity.dart';
import '../entities/download_preference_entity.dart';
import '../repositories/preference_repository.dart';

class GetPreferencesUseCase {
  final PreferenceRepository repository;
  GetPreferencesUseCase(this.repository);
  Future<Result<UserPreferenceEntity>> call() => repository.getPreferences();
}

class UpdateAppearancePreferenceUseCase {
  final PreferenceRepository repository;
  UpdateAppearancePreferenceUseCase(this.repository);
  Future<Result<void>> call(AppearancePreferenceEntity pref) => repository.updateAppearancePreference(pref);
}

class UpdateLanguagePreferenceUseCase {
  final PreferenceRepository repository;
  UpdateLanguagePreferenceUseCase(this.repository);
  Future<Result<void>> call(LanguagePreferenceEntity pref) => repository.updateLanguagePreference(pref);
}

class UpdateAccessibilityPreferenceUseCase {
  final PreferenceRepository repository;
  UpdateAccessibilityPreferenceUseCase(this.repository);
  Future<Result<void>> call(AccessibilityPreferenceEntity pref) => repository.updateAccessibilityPreference(pref);
}

class UpdateNotificationPreferenceUseCase {
  final PreferenceRepository repository;
  UpdateNotificationPreferenceUseCase(this.repository);
  Future<Result<void>> call(NotificationPreferenceEntity pref) => repository.updateNotificationPreference(pref);
}

class UpdatePrivacyPreferenceUseCase {
  final PreferenceRepository repository;
  UpdatePrivacyPreferenceUseCase(this.repository);
  Future<Result<void>> call(PrivacyPreferenceEntity pref) => repository.updatePrivacyPreference(pref);
}

class UpdatePlaybackPreferenceUseCase {
  final PreferenceRepository repository;
  UpdatePlaybackPreferenceUseCase(this.repository);
  Future<Result<void>> call(PlaybackPreferenceEntity pref) => repository.updatePlaybackPreference(pref);
}

class UpdateReadingPreferenceUseCase {
  final PreferenceRepository repository;
  UpdateReadingPreferenceUseCase(this.repository);
  Future<Result<void>> call(ReadingPreferenceEntity pref) => repository.updateReadingPreference(pref);
}

class UpdateDownloadPreferenceUseCase {
  final PreferenceRepository repository;
  UpdateDownloadPreferenceUseCase(this.repository);
  Future<Result<void>> call(DownloadPreferenceEntity pref) => repository.updateDownloadPreference(pref);
}

class ResetPreferencesUseCase {
  final PreferenceRepository repository;
  ResetPreferencesUseCase(this.repository);
  Future<Result<void>> call() => repository.resetPreferences();
}

class ExportPreferencesUseCase {
  final PreferenceRepository repository;
  ExportPreferencesUseCase(this.repository);
  Future<Result<String>> call() => repository.exportPreferences();
}

class ImportPreferencesUseCase {
  final PreferenceRepository repository;
  ImportPreferencesUseCase(this.repository);
  Future<Result<void>> call(String jsonString) => repository.importPreferences(jsonString);
}
