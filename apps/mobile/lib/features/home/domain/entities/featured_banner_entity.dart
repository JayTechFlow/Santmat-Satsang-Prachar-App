class FeaturedBannerEntity {
  final String id;
  final String title;
  final String imageUrl;
  final String? targetRoute;
  final int slot;

  const FeaturedBannerEntity({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.targetRoute,
    this.slot = 1,
  });
}
