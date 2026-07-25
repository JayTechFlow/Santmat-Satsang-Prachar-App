import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/mock_preference_data_source.dart';
import '../../data/repositories/preference_repository_impl.dart';
import '../../domain/repositories/preference_repository.dart';
import '../../domain/usecases/preference_usecases.dart';
import '../../domain/entities/appearance_preference_entity.dart';
import '../../domain/entities/language_preference_entity.dart';
import '../../domain/entities/accessibility_preference_entity.dart';
import '../../domain/entities/notification_preference_entity.dart';
import '../../domain/entities/privacy_preference_entity.dart';
import '../../domain/entities/playback_preference_entity.dart';
import '../../domain/entities/reading_preference_entity.dart';
import '../../domain/entities/download_preference_entity.dart';
import 'preferences_state.dart';

final mockPreferenceDataSourceProvider = Provider((ref) => MockPreferenceDataSource());

final preferenceRepositoryProvider = Provider<PreferenceRepository>((ref) {
  return PreferenceRepositoryImpl(ref.watch(mockPreferenceDataSourceProvider));
});

final getPreferencesUseCaseProvider = Provider((ref) => GetPreferencesUseCase(ref.watch(preferenceRepositoryProvider)));
final updateAppearancePreferenceUseCaseProvider = Provider((ref) => UpdateAppearancePreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final updateLanguagePreferenceUseCaseProvider = Provider((ref) => UpdateLanguagePreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final updateAccessibilityPreferenceUseCaseProvider = Provider((ref) => UpdateAccessibilityPreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final updateNotificationPreferenceUseCaseProvider = Provider((ref) => UpdateNotificationPreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final updatePrivacyPreferenceUseCaseProvider = Provider((ref) => UpdatePrivacyPreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final updatePlaybackPreferenceUseCaseProvider = Provider((ref) => UpdatePlaybackPreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final updateReadingPreferenceUseCaseProvider = Provider((ref) => UpdateReadingPreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final updateDownloadPreferenceUseCaseProvider = Provider((ref) => UpdateDownloadPreferenceUseCase(ref.watch(preferenceRepositoryProvider)));
final resetPreferencesUseCaseProvider = Provider((ref) => ResetPreferencesUseCase(ref.watch(preferenceRepositoryProvider)));

class PreferencesNotifier extends Notifier<PreferencesState> {
  bool _mounted = true;

  @override
  PreferencesState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadData();
    });
    return const PreferencesState(isLoading: true);
  }

  Future<void> loadData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final res = await ref.read(getPreferencesUseCaseProvider).call();
      if (!_mounted) return;

      if (res.isError) throw Exception(res.error);

      state = state.copyWith(
        isLoading: false,
        preferences: res.data,
      );
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }

  Future<void> updateAppearance(AppearancePreferenceEntity pref) async {
    await ref.read(updateAppearancePreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> updateLanguage(LanguagePreferenceEntity pref) async {
    await ref.read(updateLanguagePreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> updateAccessibility(AccessibilityPreferenceEntity pref) async {
    await ref.read(updateAccessibilityPreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> updateNotification(NotificationPreferenceEntity pref) async {
    await ref.read(updateNotificationPreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> updatePrivacy(PrivacyPreferenceEntity pref) async {
    await ref.read(updatePrivacyPreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> updatePlayback(PlaybackPreferenceEntity pref) async {
    await ref.read(updatePlaybackPreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> updateReading(ReadingPreferenceEntity pref) async {
    await ref.read(updateReadingPreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> updateDownload(DownloadPreferenceEntity pref) async {
    await ref.read(updateDownloadPreferenceUseCaseProvider).call(pref);
    await loadData();
  }

  Future<void> resetAll() async {
    await ref.read(resetPreferencesUseCaseProvider).call();
    await loadData();
  }
}

final preferencesProvider = NotifierProvider<PreferencesNotifier, PreferencesState>(PreferencesNotifier.new);
