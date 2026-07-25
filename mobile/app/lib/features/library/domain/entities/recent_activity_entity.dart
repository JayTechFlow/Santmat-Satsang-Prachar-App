import 'library_item_entity.dart';

class RecentActivityEntity {
  final String id;
  final LibraryItemEntity item;
  final DateTime activityDate;
  final String activityType; // 'viewed', 'listened', 'read'

  const RecentActivityEntity({
    required this.id,
    required this.item,
    required this.activityDate,
    required this.activityType,
  });
}
