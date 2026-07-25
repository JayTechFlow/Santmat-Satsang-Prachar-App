import '../../domain/entities/user_preference_entity.dart';

class PreferencesState {
  final bool isLoading;
  final String? error;
  final UserPreferenceEntity? preferences;

  const PreferencesState({
    this.isLoading = false,
    this.error,
    this.preferences,
  });

  PreferencesState copyWith({
    bool? isLoading,
    String? error,
    UserPreferenceEntity? preferences,
  }) {
    return PreferencesState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      preferences: preferences ?? this.preferences,
    );
  }
}
