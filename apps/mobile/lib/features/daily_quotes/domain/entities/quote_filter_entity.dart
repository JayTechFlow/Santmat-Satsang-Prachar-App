class QuoteFilterEntity {
  final String? categoryId;
  final String? authorId;
  final String? language;
  final bool? isFeatured;
  final bool? isFavorite;
  final bool? isDaily;

  const QuoteFilterEntity({
    this.categoryId,
    this.authorId,
    this.language,
    this.isFeatured,
    this.isFavorite,
    this.isDaily,
  });
}
