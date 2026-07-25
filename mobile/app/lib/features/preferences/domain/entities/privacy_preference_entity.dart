class PrivacyPreferenceEntity {
  final bool analyticsOptIn;
  final bool crashReportingOptIn;
  final bool personalizedAds;

  const PrivacyPreferenceEntity({
    required this.analyticsOptIn,
    required this.crashReportingOptIn,
    required this.personalizedAds,
  });

  PrivacyPreferenceEntity copyWith({
    bool? analyticsOptIn,
    bool? crashReportingOptIn,
    bool? personalizedAds,
  }) {
    return PrivacyPreferenceEntity(
      analyticsOptIn: analyticsOptIn ?? this.analyticsOptIn,
      crashReportingOptIn: crashReportingOptIn ?? this.crashReportingOptIn,
      personalizedAds: personalizedAds ?? this.personalizedAds,
    );
  }
}
