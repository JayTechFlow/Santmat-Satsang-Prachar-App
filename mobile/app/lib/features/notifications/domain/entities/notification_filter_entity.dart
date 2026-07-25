class NotificationFilterEntity {
  final bool? isRead;
  final String? categoryId;
  final String? priority;
  final bool? newestFirst;

  const NotificationFilterEntity({
    this.isRead,
    this.categoryId,
    this.priority,
    this.newestFirst,
  });
}
