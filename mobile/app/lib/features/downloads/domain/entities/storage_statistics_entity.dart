class StorageStatisticsEntity {
  final int totalSpace;
  final int freeSpace;
  final int appUsage;
  final int downloadsUsage;
  final int cacheUsage;
  final Map<String, int> usageByContentType;

  const StorageStatisticsEntity({
    required this.totalSpace,
    required this.freeSpace,
    required this.appUsage,
    required this.downloadsUsage,
    required this.cacheUsage,
    required this.usageByContentType,
  });
}
