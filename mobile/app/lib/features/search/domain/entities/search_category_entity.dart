import 'search_result_entity.dart';

class SearchCategoryEntity {
  final String id;
  final String name;
  final SearchContentType type;

  const SearchCategoryEntity({
    required this.id,
    required this.name,
    required this.type,
  });
}
