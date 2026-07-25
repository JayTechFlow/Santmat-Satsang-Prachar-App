import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';

class QuoteDto {
  final String id;
  final String quoteText;
  final QuoteAuthorEntity author;
  final QuoteCategoryEntity category;
  final String language;
  final String reference;
  final List<String> tags;
  final DateTime createdDate;
  final bool isFeatured;
  final bool isDaily;
  final String backgroundImageUrl;
  final String gradientThemeId;

  QuoteDto({
    required this.id,
    required this.quoteText,
    required this.author,
    required this.category,
    required this.language,
    required this.reference,
    required this.tags,
    required this.createdDate,
    required this.isFeatured,
    required this.isDaily,
    required this.backgroundImageUrl,
    required this.gradientThemeId,
  });

  factory QuoteDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    final authorMap = data['author'] as Map<String, dynamic>? ?? {};
    final author = QuoteAuthorEntity(
      id: authorMap['id'] as String? ?? '',
      name: authorMap['name'] as String? ?? '',
      bio: authorMap['bio'] as String? ?? '',
      imageUrl: authorMap['imageUrl'] as String? ?? '',
    );

    final categoryMap = data['category'] as Map<String, dynamic>? ?? {};
    final category = QuoteCategoryEntity(
      id: categoryMap['id'] as String? ?? '',
      name: categoryMap['name'] as String? ?? '',
      description: categoryMap['description'] as String? ?? '',
    );

    return QuoteDto(
      id: doc.id,
      quoteText: data['quoteText'] as String? ?? '',
      author: author,
      category: category,
      language: data['language'] as String? ?? '',
      reference: data['reference'] as String? ?? '',
      tags: List<String>.from(data['tags'] ?? []),
      createdDate: (data['createdDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      isFeatured: data['isFeatured'] as bool? ?? false,
      isDaily: data['isDaily'] as bool? ?? false,
      backgroundImageUrl: data['backgroundImageUrl'] as String? ?? '',
      gradientThemeId: data['gradientThemeId'] as String? ?? '',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'quoteText': quoteText,
      'author': {
        'id': author.id,
        'name': author.name,
        'bio': author.bio,
        'imageUrl': author.imageUrl,
      },
      'category': {
        'id': category.id,
        'name': category.name,
        'description': category.description,
      },
      'language': language,
      'reference': reference,
      'tags': tags,
      'createdDate': Timestamp.fromDate(createdDate),
      'isFeatured': isFeatured,
      'isDaily': isDaily,
      'backgroundImageUrl': backgroundImageUrl,
      'gradientThemeId': gradientThemeId,
    };
  }

  DailyQuoteEntity toEntity({bool isFavorite = false}) {
    return DailyQuoteEntity(
      id: id,
      quoteText: quoteText,
      author: author,
      category: category,
      language: language,
      reference: reference,
      tags: tags,
      createdDate: createdDate,
      isFeatured: isFeatured,
      isFavorite: isFavorite, // Resolved from local DB or context usually
      isDaily: isDaily,
      backgroundImageUrl: backgroundImageUrl,
      gradientThemeId: gradientThemeId,
    );
  }
}
