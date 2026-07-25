class AudioFilterEntity {
  final String? categoryId;
  final String? speaker;
  final String? language;
  final bool? isFeatured;
  final bool? isPopular;
  final bool? isRecentlyAdded;
  final String? searchQuery;

  const AudioFilterEntity({
    this.categoryId,
    this.speaker,
    this.language,
    this.isFeatured,
    this.isPopular,
    this.isRecentlyAdded,
    this.searchQuery,
  });
}
