class AppearancePreferenceEntity {
  final String themeMode; // 'light', 'dark', 'system'
  final bool useDynamicColors;
  final String primaryColor;

  const AppearancePreferenceEntity({
    required this.themeMode,
    required this.useDynamicColors,
    required this.primaryColor,
  });

  AppearancePreferenceEntity copyWith({
    String? themeMode,
    bool? useDynamicColors,
    String? primaryColor,
  }) {
    return AppearancePreferenceEntity(
      themeMode: themeMode ?? this.themeMode,
      useDynamicColors: useDynamicColors ?? this.useDynamicColors,
      primaryColor: primaryColor ?? this.primaryColor,
    );
  }
}
