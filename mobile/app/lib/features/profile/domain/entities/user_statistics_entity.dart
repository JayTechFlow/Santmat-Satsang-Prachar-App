class UserStatisticsEntity {
  final int downloadCount;
  final int favoriteCount;
  final int bookmarkCount;
  final Duration totalListeningTime;
  final double readingProgressPercentage;

  const UserStatisticsEntity({
    required this.downloadCount,
    required this.favoriteCount,
    required this.bookmarkCount,
    required this.totalListeningTime,
    required this.readingProgressPercentage,
  });
}
