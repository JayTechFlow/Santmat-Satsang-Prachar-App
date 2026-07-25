class SatsangFilterEntity {
  final String? categoryId;
  final String? speakerId;
  final String? language;
  final bool? isFeatured;
  final bool? isPopular;
  final bool? isRecentlyAdded;
  final String? searchQuery;

  const SatsangFilterEntity({
    this.categoryId,
    this.speakerId,
    this.language,
    this.isFeatured,
    this.isPopular,
    this.isRecentlyAdded,
    this.searchQuery,
  });

  SatsangFilterEntity copyWith({
    String? categoryId,
    String? speakerId,
    String? language,
    bool? isFeatured,
    bool? isPopular,
    bool? isRecentlyAdded,
    String? searchQuery,
  }) {
    return SatsangFilterEntity(
      categoryId: categoryId ?? this.categoryId,
      speakerId: speakerId ?? this.speakerId,
      language: language ?? this.language,
      isFeatured: isFeatured ?? this.isFeatured,
      isPopular: isPopular ?? this.isPopular,
      isRecentlyAdded: isRecentlyAdded ?? this.isRecentlyAdded,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}
