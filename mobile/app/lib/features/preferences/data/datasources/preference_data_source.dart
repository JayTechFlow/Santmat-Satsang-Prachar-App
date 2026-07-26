import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/appearance_preference_entity.dart';
import '../../domain/entities/language_preference_entity.dart';
import '../../domain/entities/accessibility_preference_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../../domain/entities/privacy_preference_entity.dart';
import '../../domain/entities/playback_preference_entity.dart';
import '../../domain/entities/reading_preference_entity.dart';
import '../../domain/entities/download_preference_entity.dart';

abstract class PreferenceDataSource {
  Future<UserPreferenceEntity> getPreferences();
  Future<void> updateAppearancePreference(AppearancePreferenceEntity pref);
  Future<void> updateLanguagePreference(LanguagePreferenceEntity pref);
  Future<void> updateAccessibilityPreference(
    AccessibilityPreferenceEntity pref,
  );
  Future<void> updateNotificationPreference(NotificationPreferenceEntity pref);
  Future<void> updatePrivacyPreference(PrivacyPreferenceEntity pref);
  Future<void> updatePlaybackPreference(PlaybackPreferenceEntity pref);
  Future<void> updateReadingPreference(ReadingPreferenceEntity pref);
  Future<void> updateDownloadPreference(DownloadPreferenceEntity pref);
  Future<void> resetPreferences();
  Future<String> exportPreferences();
  Future<void> importPreferences(String jsonString);
}
