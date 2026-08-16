class PreferenceCategoryEntity {
  final String id;
  final String title;
  final String description;
  final String iconName;
  final String route;

  const PreferenceCategoryEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.iconName,
    required this.route,
  });
}

class PreferenceFilterEntity {
  final String? searchQuery;
  final String? categoryId;

  const PreferenceFilterEntity({this.searchQuery, this.categoryId});
}
