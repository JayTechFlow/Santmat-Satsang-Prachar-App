class DonationFilterEntity {
  final String? categoryId;
  final bool? isFeatured;
  final bool? isActive;
  final bool? taxBenefit;

  const DonationFilterEntity({
    this.categoryId,
    this.isFeatured,
    this.isActive,
    this.taxBenefit,
  });
}
