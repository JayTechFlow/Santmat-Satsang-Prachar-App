class ReadingPreferenceEntity {
  final double fontSize;
  final double lineHeight;
  final String fontFamily;
  final String theme; // 'light', 'dark', 'sepia'
  final bool keepScreenOn;

  const ReadingPreferenceEntity({
    required this.fontSize,
    required this.lineHeight,
    required this.fontFamily,
    required this.theme,
    required this.keepScreenOn,
  });

  ReadingPreferenceEntity copyWith({
    double? fontSize,
    double? lineHeight,
    String? fontFamily,
    String? theme,
    bool? keepScreenOn,
  }) {
    return ReadingPreferenceEntity(
      fontSize: fontSize ?? this.fontSize,
      lineHeight: lineHeight ?? this.lineHeight,
      fontFamily: fontFamily ?? this.fontFamily,
      theme: theme ?? this.theme,
      keepScreenOn: keepScreenOn ?? this.keepScreenOn,
    );
  }
}
