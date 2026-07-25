class BookFilterEntity {
  final String? categoryId;
  final String? authorId;
  final String? language;
  final bool? isFeatured;
  final bool? isPopular;
  final bool? isRecentlyAdded;
  final String? searchQuery;

  const BookFilterEntity({
    this.categoryId,
    this.authorId,
    this.language,
    this.isFeatured,
    this.isPopular,
    this.isRecentlyAdded,
    this.searchQuery,
  });
}
