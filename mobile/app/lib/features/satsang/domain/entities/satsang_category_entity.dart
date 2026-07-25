class SatsangCategoryEntity {
  final String id;
  final String name;
  final String? iconUrl;

  const SatsangCategoryEntity({
    required this.id,
    required this.name,
    this.iconUrl,
  });
}
