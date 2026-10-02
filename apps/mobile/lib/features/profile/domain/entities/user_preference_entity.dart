class UserPreferenceEntity {
  final String languageCode;
  final String themeMode; // 'light', 'dark', 'system'
  final bool notificationsEnabled;
  final double devanagariFontScale;
  final String audioQuality; // 'high', 'standard', 'low'

  const UserPreferenceEntity({
    required this.languageCode,
    required this.themeMode,
    required this.notificationsEnabled,
    this.devanagariFontScale = 1.0,
    this.audioQuality = 'standard',
  });

  UserPreferenceEntity copyWith({
    String? languageCode,
    String? themeMode,
    bool? notificationsEnabled,
    double? devanagariFontScale,
    String? audioQuality,
  }) {
    return UserPreferenceEntity(
      languageCode: languageCode ?? this.languageCode,
      themeMode: themeMode ?? this.themeMode,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      devanagariFontScale: devanagariFontScale ?? this.devanagariFontScale,
      audioQuality: audioQuality ?? this.audioQuality,
    );
  }
}
