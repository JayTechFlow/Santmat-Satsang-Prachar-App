import 'search_category_definition.dart';
import 'search_result_entity.dart';

class SearchFilterEntity {
  final List<SearchContentType>? contentTypes;
  final String? language;

  /// The single Search category filter. `null` means no category restriction,
  /// which is what the "सभी भजन" sentinel resolves to.
  final SearchCategoryId? searchCategory;

  final String? speakerId;
  final String? authorId;
  final bool? isFeatured;
  final bool? isRecentlyAdded;

  const SearchFilterEntity({
    this.contentTypes,
    this.language,
    this.searchCategory,
    this.speakerId,
    this.authorId,
    this.isFeatured,
    this.isRecentlyAdded,
  });

  /// Filter that applies a category, or no restriction for [categoryId] when it
  /// is null / the ALL sentinel.
  factory SearchFilterEntity.forCategory(SearchCategoryId? categoryId) {
    if (categoryId == null || categoryId == SearchCategoryId.allBhajan) {
      return const SearchFilterEntity();
    }
    return SearchFilterEntity(searchCategory: categoryId);
  }

  /// Resolved definition, or null when no category restriction applies.
  SearchCategoryDefinition? get categoryDefinition =>
      searchCategory == null ? null : SearchCategories.byId(searchCategory!);

  @override
  String toString() => 'SearchFilterEntity(searchCategory: $searchCategory)';
}