import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';

class SearchResultDto extends SearchResultEntity {
  const SearchResultDto({
    required super.id,
    required super.title,
    required super.subtitle,
    required super.imageUrl,
    required super.type,
    required super.routePath,
    required super.date,
    required super.tags,
  });

  factory SearchResultDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return SearchResultDto(
      id: doc.id,
      title: data['title'] ?? '',
      subtitle: data['subtitle'] ?? '',
      imageUrl: data['imageUrl'] ?? '',
      type: SearchContentType.values.firstWhere(
        (e) => e.toString().split('.').last == data['type'],
        orElse: () => SearchContentType.satsang,
      ),
      routePath: data['routePath'] ?? '',
      date: (data['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
      tags: List<String>.from(data['tags'] ?? []),
    );
  }
}

class SearchSuggestionDto extends SearchSuggestionEntity {
  const SearchSuggestionDto({required super.suggestion});
}