import 'quote_category_entity.dart';
import 'quote_author_entity.dart';

class DailyQuoteEntity {
  final String id;
  final String quoteText;
  final QuoteAuthorEntity author;
  final QuoteCategoryEntity category;
  final String language;
  final String reference;
  final List<String> tags;
  final DateTime createdDate;
  final bool isFeatured;
  final bool isFavorite;
  final bool isDaily;
  final String backgroundImageUrl;
  final String gradientThemeId;

  const DailyQuoteEntity({
    required this.id,
    required this.quoteText,
    required this.author,
    required this.category,
    required this.language,
    required this.reference,
    required this.tags,
    required this.createdDate,
    required this.isFeatured,
    required this.isFavorite,
    required this.isDaily,
    required this.backgroundImageUrl,
    required this.gradientThemeId,
  });
}
