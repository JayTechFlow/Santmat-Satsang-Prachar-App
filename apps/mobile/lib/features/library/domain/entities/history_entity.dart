import 'library_item_entity.dart';

class HistoryEntity {
  final String id;
  final LibraryItemEntity item;
  final DateTime accessedDate;
  final double? sessionProgress;

  const HistoryEntity({
    required this.id,
    required this.item,
    required this.accessedDate,
    this.sessionProgress,
  });
}
