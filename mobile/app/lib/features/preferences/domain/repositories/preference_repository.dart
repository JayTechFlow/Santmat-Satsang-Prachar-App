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

abstract class PreferenceRepository {
  Future<Result<UserPreferenceEntity>> getPreferences();
  
  Future<Result<void>> updateAppearancePreference(AppearancePreferenceEntity preference);
  Future<Result<void>> updateLanguagePreference(LanguagePreferenceEntity preference);
  Future<Result<void>> updateAccessibilityPreference(AccessibilityPreferenceEntity preference);
  Future<Result<void>> updateNotificationPreference(NotificationPreferenceEntity preference);
  Future<Result<void>> updatePrivacyPreference(PrivacyPreferenceEntity preference);
  Future<Result<void>> updatePlaybackPreference(PlaybackPreferenceEntity preference);
  Future<Result<void>> updateReadingPreference(ReadingPreferenceEntity preference);
  Future<Result<void>> updateDownloadPreference(DownloadPreferenceEntity preference);
  
  Future<Result<void>> resetPreferences();
  Future<Result<String>> exportPreferences();
  Future<Result<void>> importPreferences(String jsonString);
}
