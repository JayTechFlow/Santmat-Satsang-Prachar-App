import 'search_result_entity.dart';

class SearchFilterEntity {
  final List<SearchContentType>? contentTypes;
  final String? language;
  final String? categoryId;
  final String? speakerId;
  final String? authorId;
  final bool? isFeatured;
  final bool? isRecentlyAdded;

  const SearchFilterEntity({
    this.contentTypes,
    this.language,
    this.categoryId,
    this.speakerId,
    this.authorId,
    this.isFeatured,
    this.isRecentlyAdded,
  });
}
