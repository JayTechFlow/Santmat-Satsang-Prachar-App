class PersonalizationPreferenceEntity {
  final List<String> favoriteCategories;
  final List<String> preferredContentTypes;
  final bool enablePersonalizedRecommendations;
  final String dashboardLayout; // 'default', 'compact', 'expanded'

  const PersonalizationPreferenceEntity({
    required this.favoriteCategories,
    required this.preferredContentTypes,
    required this.enablePersonalizedRecommendations,
    required this.dashboardLayout,
  });

  PersonalizationPreferenceEntity copyWith({
    List<String>? favoriteCategories,
    List<String>? preferredContentTypes,
    bool? enablePersonalizedRecommendations,
    String? dashboardLayout,
  }) {
    return PersonalizationPreferenceEntity(
      favoriteCategories: favoriteCategories ?? this.favoriteCategories,
      preferredContentTypes: preferredContentTypes ?? this.preferredContentTypes,
      enablePersonalizedRecommendations: enablePersonalizedRecommendations ?? this.enablePersonalizedRecommendations,
      dashboardLayout: dashboardLayout ?? this.dashboardLayout,
    );
  }
}
