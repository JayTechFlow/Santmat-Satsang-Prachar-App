import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/appearance_preference_entity.dart';
import '../../domain/entities/language_preference_entity.dart';
import '../../domain/entities/accessibility_preference_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../../domain/entities/privacy_preference_entity.dart';
import '../../domain/entities/playback_preference_entity.dart';
import '../../domain/entities/reading_preference_entity.dart';
import '../../domain/entities/download_preference_entity.dart';
import '../../domain/entities/personalization_preference_entity.dart';

class PreferenceDto extends UserPreferenceEntity {
  const PreferenceDto({
    required super.userId,
    required super.appearance,
    required super.language,
    required super.accessibility,
    required super.notification,
    required super.privacy,
    required super.playback,
    required super.reading,
    required super.download,
    required super.personalization,
    required super.lastUpdated,
    required super.version,
  });

  factory PreferenceDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    return PreferenceDto(
      userId: doc.id,
      appearance: AppearancePreferenceEntity(
        themeMode: data['appearance']?['themeMode'] ?? 'system',
        useDynamicColors: data['appearance']?['useDynamicColors'] ?? true,
        primaryColor: data['appearance']?['primaryColor'] ?? 'default',
      ),
      language: LanguagePreferenceEntity(
        languageCode: data['language']?['languageCode'] ?? 'en',
        autoTranslateContent:
            data['language']?['autoTranslateContent'] ?? false,
        speechToTextLanguage:
            data['language']?['speechToTextLanguage'] ?? 'en-US',
      ),
      accessibility: AccessibilityPreferenceEntity(
        textScaleFactor: (data['accessibility']?['textScaleFactor'] ?? 1.0)
            .toDouble(),
        highContrast: data['accessibility']?['highContrast'] ?? false,
        reducedMotion: data['accessibility']?['reducedMotion'] ?? false,
        screenReaderOptimized:
            data['accessibility']?['screenReaderOptimized'] ?? false,
      ),
      notification: NotificationPreferenceEntity(
        enableAll: data['notification']?['enableAll'] ?? true,
        newSatsangAlerts: data['notification']?['newSatsangAlerts'] ?? true,
        dailyQuotes: data['notification']?['dailyQuotes'] ?? true,
        eventReminders: data['notification']?['eventReminders'] ?? true,
        appUpdates: data['notification']?['appUpdates'] ?? true,
      ),
      privacy: PrivacyPreferenceEntity(
        analyticsOptIn: data['privacy']?['analyticsOptIn'] ?? true,
        crashReportingOptIn: data['privacy']?['crashReportingOptIn'] ?? true,
        personalizedAds: data['privacy']?['personalizedAds'] ?? false,
      ),
      playback: PlaybackPreferenceEntity(
        autoPlay: data['playback']?['autoPlay'] ?? true,
        playbackSpeed: (data['playback']?['playbackSpeed'] ?? 1.0).toDouble(),
        backgroundAudio: data['playback']?['backgroundAudio'] ?? true,
        continueFromLastPosition:
            data['playback']?['continueFromLastPosition'] ?? true,
      ),
      reading: ReadingPreferenceEntity(
        fontSize: (data['reading']?['fontSize'] ?? 16.0).toDouble(),
        lineHeight: (data['reading']?['lineHeight'] ?? 1.5).toDouble(),
        fontFamily: data['reading']?['fontFamily'] ?? 'Roboto',
        theme: data['reading']?['theme'] ?? 'light',
        keepScreenOn: data['reading']?['keepScreenOn'] ?? true,
      ),
      download: DownloadPreferenceEntity(
        downloadQuality: data['download']?['downloadQuality'] ?? 'high',
        downloadOverWifiOnly: data['download']?['downloadOverWifiOnly'] ?? true,
        storagePreference: data['download']?['storagePreference'] ?? 'internal',
        autoDeleteCompleted: data['download']?['autoDeleteCompleted'] ?? false,
      ),
      personalization: PersonalizationPreferenceEntity(
        favoriteCategories: List<String>.from(
          data['personalization']?['favoriteCategories'] ?? [],
        ),
        preferredContentTypes: List<String>.from(
          data['personalization']?['preferredContentTypes'] ?? [],
        ),
        enablePersonalizedRecommendations:
            data['personalization']?['enablePersonalizedRecommendations'] ??
            true,
        dashboardLayout:
            data['personalization']?['dashboardLayout'] ?? 'default',
      ),
      lastUpdated:
          (data['lastUpdated'] as Timestamp?)?.toDate() ?? DateTime.now(),
      version: data['version'] ?? '1.0.0',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'appearance': {
        'themeMode': appearance.themeMode,
        'useDynamicColors': appearance.useDynamicColors,
        'primaryColor': appearance.primaryColor,
      },
      'language': {
        'languageCode': language.languageCode,
        'autoTranslateContent': language.autoTranslateContent,
        'speechToTextLanguage': language.speechToTextLanguage,
      },
      'accessibility': {
        'textScaleFactor': accessibility.textScaleFactor,
        'highContrast': accessibility.highContrast,
        'reducedMotion': accessibility.reducedMotion,
        'screenReaderOptimized': accessibility.screenReaderOptimized,
      },
      'notification': {
        'enableAll': notification.enableAll,
        'newSatsangAlerts': notification.newSatsangAlerts,
        'dailyQuotes': notification.dailyQuotes,
        'eventReminders': notification.eventReminders,
        'appUpdates': notification.appUpdates,
      },
      'privacy': {
        'analyticsOptIn': privacy.analyticsOptIn,
        'crashReportingOptIn': privacy.crashReportingOptIn,
        'personalizedAds': privacy.personalizedAds,
      },
      'playback': {
        'autoPlay': playback.autoPlay,
        'playbackSpeed': playback.playbackSpeed,
        'backgroundAudio': playback.backgroundAudio,
        'continueFromLastPosition': playback.continueFromLastPosition,
      },
      'reading': {
        'fontSize': reading.fontSize,
        'lineHeight': reading.lineHeight,
        'fontFamily': reading.fontFamily,
        'theme': reading.theme,
        'keepScreenOn': reading.keepScreenOn,
      },
      'download': {
        'downloadQuality': download.downloadQuality,
        'downloadOverWifiOnly': download.downloadOverWifiOnly,
        'storagePreference': download.storagePreference,
        'autoDeleteCompleted': download.autoDeleteCompleted,
      },
      'personalization': {
        'favoriteCategories': personalization.favoriteCategories,
        'preferredContentTypes': personalization.preferredContentTypes,
        'enablePersonalizedRecommendations':
            personalization.enablePersonalizedRecommendations,
        'dashboardLayout': personalization.dashboardLayout,
      },
      'lastUpdated': FieldValue.serverTimestamp(),
      'version': version,
    };
  }
}
