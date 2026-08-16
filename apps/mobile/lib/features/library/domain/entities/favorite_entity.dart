import 'library_item_entity.dart';

class FavoriteEntity {
  final String id;
  final LibraryItemEntity item;
  final DateTime favoritedDate;

  const FavoriteEntity({
    required this.id,
    required this.item,
    required this.favoritedDate,
  });
}
