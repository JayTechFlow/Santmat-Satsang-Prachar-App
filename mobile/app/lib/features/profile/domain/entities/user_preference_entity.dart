class UserPreferenceEntity {
  final String languageCode;
  final String themeMode; // 'light', 'dark', 'system'
  final bool notificationsEnabled;

  const UserPreferenceEntity({
    required this.languageCode,
    required this.themeMode,
    required this.notificationsEnabled,
  });

  UserPreferenceEntity copyWith({
    String? languageCode,
    String? themeMode,
    bool? notificationsEnabled,
  }) {
    return UserPreferenceEntity(
      languageCode: languageCode ?? this.languageCode,
      themeMode: themeMode ?? this.themeMode,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
    );
  }
}
