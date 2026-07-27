class HomeBanner {
  final String id;
  final String imageUrl;
  final String? linkUrl;
  final bool isActive;
  final int sortOrder;

  const HomeBanner({
    required this.id,
    required this.imageUrl,
    this.linkUrl,
    required this.isActive,
    required this.sortOrder,
  });
}
