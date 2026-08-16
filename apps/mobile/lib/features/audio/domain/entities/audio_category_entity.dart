class AudioCategoryEntity {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;

  const AudioCategoryEntity({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
  });
}
