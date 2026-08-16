import 'appearance_preference_entity.dart';
import 'language_preference_entity.dart';
import 'accessibility_preference_entity.dart';
import 'notification_preference_entity.dart';
import 'privacy_preference_entity.dart';
import 'playback_preference_entity.dart';
import 'reading_preference_entity.dart';
import 'download_preference_entity.dart';
import 'personalization_preference_entity.dart';

class UserPreferenceEntity {
  final String userId;
  final AppearancePreferenceEntity appearance;
  final LanguagePreferenceEntity language;
  final AccessibilityPreferenceEntity accessibility;
  final NotificationPreferenceEntity notification;
  final PrivacyPreferenceEntity privacy;
  final PlaybackPreferenceEntity playback;
  final ReadingPreferenceEntity reading;
  final DownloadPreferenceEntity download;
  final PersonalizationPreferenceEntity personalization;
  final DateTime lastUpdated;
  final String version;

  const UserPreferenceEntity({
    required this.userId,
    required this.appearance,
    required this.language,
    required this.accessibility,
    required this.notification,
    required this.privacy,
    required this.playback,
    required this.reading,
    required this.download,
    required this.personalization,
    required this.lastUpdated,
    required this.version,
  });

  UserPreferenceEntity copyWith({
    String? userId,
    AppearancePreferenceEntity? appearance,
    LanguagePreferenceEntity? language,
    AccessibilityPreferenceEntity? accessibility,
    NotificationPreferenceEntity? notification,
    PrivacyPreferenceEntity? privacy,
    PlaybackPreferenceEntity? playback,
    ReadingPreferenceEntity? reading,
    DownloadPreferenceEntity? download,
    PersonalizationPreferenceEntity? personalization,
    DateTime? lastUpdated,
    String? version,
  }) {
    return UserPreferenceEntity(
      userId: userId ?? this.userId,
      appearance: appearance ?? this.appearance,
      language: language ?? this.language,
      accessibility: accessibility ?? this.accessibility,
      notification: notification ?? this.notification,
      privacy: privacy ?? this.privacy,
      playback: playback ?? this.playback,
      reading: reading ?? this.reading,
      download: download ?? this.download,
      personalization: personalization ?? this.personalization,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      version: version ?? this.version,
    );
  }
}
