import 'book_entity.dart';

class BookBookmarkEntity {
  final BookEntity book;
  final int pageNumber;
  final DateTime bookmarkedAt;
  final String? note;

  const BookBookmarkEntity({
    required this.book,
    required this.pageNumber,
    required this.bookmarkedAt,
    this.note,
  });
}
