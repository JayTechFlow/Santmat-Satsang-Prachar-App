class LanguagePreferenceEntity {
  final String languageCode; // 'en', 'hi'
  final bool autoTranslateContent;
  final String speechToTextLanguage;

  const LanguagePreferenceEntity({
    required this.languageCode,
    required this.autoTranslateContent,
    required this.speechToTextLanguage,
  });

  LanguagePreferenceEntity copyWith({
    String? languageCode,
    bool? autoTranslateContent,
    String? speechToTextLanguage,
  }) {
    return LanguagePreferenceEntity(
      languageCode: languageCode ?? this.languageCode,
      autoTranslateContent: autoTranslateContent ?? this.autoTranslateContent,
      speechToTextLanguage: speechToTextLanguage ?? this.speechToTextLanguage,
    );
  }
}
