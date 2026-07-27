class FeaturedContent {
  final String id;
  final String title;
  final String? description;
  final String type;
  final String contentId;
  final String? imageUrl;

  const FeaturedContent({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    required this.contentId,
    this.imageUrl,
  });
}
