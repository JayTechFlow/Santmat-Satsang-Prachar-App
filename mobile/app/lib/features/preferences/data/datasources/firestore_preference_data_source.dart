import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/appearance_preference_entity.dart';
import '../../domain/entities/language_preference_entity.dart';
import '../../domain/entities/accessibility_preference_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../../domain/entities/privacy_preference_entity.dart';
import '../../domain/entities/playback_preference_entity.dart';
import '../../domain/entities/reading_preference_entity.dart';
import '../../domain/entities/download_preference_entity.dart';
import 'preference_data_source.dart';

import '../models/preference_dto.dart';
import '../../domain/entities/personalization_preference_entity.dart';

class FirestorePreferenceDataSource implements PreferenceDataSource {
  final FirestoreService _firestoreService;
  final String _userId = 'mock_user_id'; // Placeholder for auth

  FirestorePreferenceDataSource(this._firestoreService);

  String get _preferencesPath => FirestoreCollections.preferences;

  @override
  Future<UserPreferenceEntity> getPreferences() async {
    final doc = await _firestoreService.getDocument(_preferencesPath, _userId);
    if (!doc.exists || doc.data() == null) {
      return _getDefaultPreferences();
    }
    return PreferenceDto.fromFirestore(doc);
  }

  @override
  Future<void> updateAppearancePreference(
    AppearancePreferenceEntity pref,
  ) async {
    await _updateField('appearance', {
      'themeMode': pref.themeMode,
      'useDynamicColors': pref.useDynamicColors,
      'primaryColor': pref.primaryColor,
    });
  }

  @override
  Future<void> updateLanguagePreference(LanguagePreferenceEntity pref) async {
    await _updateField('language', {
      'languageCode': pref.languageCode,
      'autoTranslateContent': pref.autoTranslateContent,
      'speechToTextLanguage': pref.speechToTextLanguage,
    });
  }

  @override
  Future<void> updateAccessibilityPreference(
    AccessibilityPreferenceEntity pref,
  ) async {
    await _updateField('accessibility', {
      'textScaleFactor': pref.textScaleFactor,
      'highContrast': pref.highContrast,
      'reducedMotion': pref.reducedMotion,
      'screenReaderOptimized': pref.screenReaderOptimized,
    });
  }

  @override
  Future<void> updateNotificationPreference(
    NotificationPreferenceEntity pref,
  ) async {
    await _updateField('notification', {
      'enableAll': pref.enableAll,
      'newSatsangAlerts': pref.newSatsangAlerts,
      'dailyQuotes': pref.dailyQuotes,
      'eventReminders': pref.eventReminders,
      'appUpdates': pref.appUpdates,
    });
  }

  @override
  Future<void> updatePrivacyPreference(PrivacyPreferenceEntity pref) async {
    await _updateField('privacy', {
      'analyticsOptIn': pref.analyticsOptIn,
      'crashReportingOptIn': pref.crashReportingOptIn,
      'personalizedAds': pref.personalizedAds,
    });
  }

  @override
  Future<void> updatePlaybackPreference(PlaybackPreferenceEntity pref) async {
    await _updateField('playback', {
      'autoPlay': pref.autoPlay,
      'playbackSpeed': pref.playbackSpeed,
      'backgroundAudio': pref.backgroundAudio,
      'continueFromLastPosition': pref.continueFromLastPosition,
    });
  }

  @override
  Future<void> updateReadingPreference(ReadingPreferenceEntity pref) async {
    await _updateField('reading', {
      'fontSize': pref.fontSize,
      'lineHeight': pref.lineHeight,
      'fontFamily': pref.fontFamily,
      'theme': pref.theme,
      'keepScreenOn': pref.keepScreenOn,
    });
  }

  @override
  Future<void> updateDownloadPreference(DownloadPreferenceEntity pref) async {
    await _updateField('download', {
      'downloadQuality': pref.downloadQuality,
      'downloadOverWifiOnly': pref.downloadOverWifiOnly,
      'storagePreference': pref.storagePreference,
      'autoDeleteCompleted': pref.autoDeleteCompleted,
    });
  }

  @override
  Future<void> resetPreferences() async {
    await _firestoreService.setDocument(_preferencesPath, _userId, {});
  }

  @override
  Future<String> exportPreferences() async {
    final doc = await _firestoreService.getDocument(_preferencesPath, _userId);
    return doc.data().toString();
  }

  @override
  Future<void> importPreferences(String jsonString) async {
    // Left unimplemented for simplicity
  }

  Future<void> _updateField(String field, Map<String, dynamic> data) async {
    await _firestoreService.setDocument(_preferencesPath, _userId, {
      field: data,
    }, merge: true);
  }

  UserPreferenceEntity _getDefaultPreferences() {
    return UserPreferenceEntity(
      userId: _userId,
      appearance: const AppearancePreferenceEntity(
        themeMode: 'system',
        useDynamicColors: true,
        primaryColor: 'default',
      ),
      language: const LanguagePreferenceEntity(
        languageCode: 'en',
        autoTranslateContent: false,
        speechToTextLanguage: 'en-US',
      ),
      accessibility: const AccessibilityPreferenceEntity(
        textScaleFactor: 1.0,
        highContrast: false,
        reducedMotion: false,
        screenReaderOptimized: false,
      ),
      notification: const NotificationPreferenceEntity(
        enableAll: true,
        newSatsangAlerts: true,
        dailyQuotes: true,
        eventReminders: true,
        appUpdates: true,
      ),
      privacy: const PrivacyPreferenceEntity(
        analyticsOptIn: true,
        crashReportingOptIn: true,
        personalizedAds: false,
      ),
      playback: const PlaybackPreferenceEntity(
        autoPlay: true,
        playbackSpeed: 1.0,
        backgroundAudio: true,
        continueFromLastPosition: true,
      ),
      reading: const ReadingPreferenceEntity(
        fontSize: 16.0,
        lineHeight: 1.5,
        fontFamily: 'Roboto',
        theme: 'light',
        keepScreenOn: true,
      ),
      download: const DownloadPreferenceEntity(
        downloadQuality: 'high',
        downloadOverWifiOnly: true,
        storagePreference: 'internal',
        autoDeleteCompleted: false,
      ),
      personalization: const PersonalizationPreferenceEntity(
        favoriteCategories: ['Meditation', 'Santmat'],
        preferredContentTypes: ['audio', 'book'],
        enablePersonalizedRecommendations: true,
        dashboardLayout: 'default',
      ),
      lastUpdated: DateTime.now(),
      version: '1.0.0',
    );
  }
}
