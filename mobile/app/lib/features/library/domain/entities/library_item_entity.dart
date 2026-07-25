class LibraryItemEntity {
  final String id;
  final String contentId;
  final String contentType; // 'audio', 'book', 'satsang', 'quote', 'event', 'download'
  final String title;
  final String subtitle;
  final String thumbnail;
  final String category;
  final String? author;
  final DateTime createdDate;
  final DateTime? lastOpened;
  final bool isFavorite;
  final bool isBookmarked;
  final double? progress; // 0.0 to 1.0
  final String sourceModule;
  final String route; // used for GoRouter navigation

  const LibraryItemEntity({
    required this.id,
    required this.contentId,
    required this.contentType,
    required this.title,
    required this.subtitle,
    required this.thumbnail,
    required this.category,
    this.author,
    required this.createdDate,
    this.lastOpened,
    this.isFavorite = false,
    this.isBookmarked = false,
    this.progress,
    required this.sourceModule,
    required this.route,
  });
}
