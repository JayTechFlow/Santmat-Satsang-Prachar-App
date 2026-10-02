import 'dart:convert';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/appearance_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/language_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/accessibility_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/notification_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/privacy_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/playback_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/reading_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/download_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/entities/personalization_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/preferences/data/datasources/preference_data_source.dart';

class MockPreferenceDataSource implements PreferenceDataSource {
  late UserPreferenceEntity _preferences;

  MockPreferenceDataSource() {
    _initDefaults();
  }

  void _initDefaults() {
    _preferences = UserPreferenceEntity(
      userId: 'user_123',
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

  @override
  Future<UserPreferenceEntity> getPreferences() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _preferences;
  }

  @override
  Future<void> updateAppearancePreference(
    AppearancePreferenceEntity pref,
  ) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(appearance: pref);
  }

  @override
  Future<void> updateLanguagePreference(LanguagePreferenceEntity pref) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(language: pref);
  }

  @override
  Future<void> updateAccessibilityPreference(
    AccessibilityPreferenceEntity pref,
  ) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(accessibility: pref);
  }

  @override
  Future<void> updateNotificationPreference(
    NotificationPreferenceEntity pref,
  ) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(notification: pref);
  }

  @override
  Future<void> updatePrivacyPreference(PrivacyPreferenceEntity pref) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(privacy: pref);
  }

  @override
  Future<void> updatePlaybackPreference(PlaybackPreferenceEntity pref) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(playback: pref);
  }

  @override
  Future<void> updateReadingPreference(ReadingPreferenceEntity pref) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(reading: pref);
  }

  @override
  Future<void> updateDownloadPreference(DownloadPreferenceEntity pref) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _preferences = _preferences.copyWith(download: pref);
  }

  @override
  Future<void> resetPreferences() async {
    await Future.delayed(const Duration(milliseconds: 300));
    _initDefaults();
  }

  @override
  Future<String> exportPreferences() async {
    await Future.delayed(const Duration(milliseconds: 200));
    // Simulated JSON export
    final map = {
      'appearance': {'themeMode': _preferences.appearance.themeMode},
      // In a real implementation this would map all properties
    };
    return jsonEncode(map);
  }

  @override
  Future<void> importPreferences(String jsonString) async {
    await Future.delayed(const Duration(milliseconds: 200));
    // Simulated JSON import
    // In a real implementation this would parse and update _preferences
  }
}
