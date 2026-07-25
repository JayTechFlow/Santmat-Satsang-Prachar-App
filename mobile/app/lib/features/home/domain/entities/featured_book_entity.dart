class FeaturedBookEntity {
  final String id;
  final String title;
  final String author;
  final String coverImageUrl;
  final String? pdfUrl;

  const FeaturedBookEntity({
    required this.id,
    required this.title,
    required this.author,
    required this.coverImageUrl,
    this.pdfUrl,
  });
}
