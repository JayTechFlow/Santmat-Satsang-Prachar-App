import 'library_item_entity.dart';

class LibraryCollectionEntity {
  final String id;
  final String name;
  final List<LibraryItemEntity> items;
  final DateTime createdDate;

  const LibraryCollectionEntity({
    required this.id,
    required this.name,
    required this.items,
    required this.createdDate,
  });
}
