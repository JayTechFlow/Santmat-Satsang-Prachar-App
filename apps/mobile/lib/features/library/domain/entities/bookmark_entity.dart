import 'library_item_entity.dart';

class BookmarkEntity {
  final String id;
  final LibraryItemEntity item;
  final DateTime bookmarkedDate;

  const BookmarkEntity({
    required this.id,
    required this.item,
    required this.bookmarkedDate,
  });
}
