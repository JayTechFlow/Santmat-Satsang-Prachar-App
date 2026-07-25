import 'book_entity.dart';

class ReadingProgressEntity {
  final BookEntity book;
  final int lastReadPage;
  final double percentage;
  final DateTime lastReadAt;

  const ReadingProgressEntity({
    required this.book,
    required this.lastReadPage,
    required this.percentage,
    required this.lastReadAt,
  });
}
