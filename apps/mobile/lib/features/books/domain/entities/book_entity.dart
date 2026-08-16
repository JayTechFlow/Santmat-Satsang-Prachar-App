import 'book_category_entity.dart';
import 'book_author_entity.dart';
import 'book_chapter_entity.dart';

class BookEntity {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final BookAuthorEntity author;
  final BookCategoryEntity category;
  final String language;
  final String edition;
  final DateTime publicationDate;
  final int pageCount;
  final Duration estimatedReadingTime;
  final String coverImageUrl;
  final String thumbnailUrl;
  final List<String> tags;
  final bool isFeatured;
  final bool isPopular;
  final bool isRecentlyAdded;
  final List<BookChapterEntity> chapters;
  final String pdfUrlPlaceholder;

  const BookEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.author,
    required this.category,
    required this.language,
    required this.edition,
    required this.publicationDate,
    required this.pageCount,
    required this.estimatedReadingTime,
    required this.coverImageUrl,
    required this.thumbnailUrl,
    required this.tags,
    required this.isFeatured,
    required this.isPopular,
    required this.isRecentlyAdded,
    required this.chapters,
    required this.pdfUrlPlaceholder,
  });
}
