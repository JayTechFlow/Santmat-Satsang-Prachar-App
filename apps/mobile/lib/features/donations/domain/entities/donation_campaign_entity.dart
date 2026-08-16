import 'donation_category_entity.dart';

class DonationCampaignEntity {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final DonationCategoryEntity category;
  final double goalAmount;
  final double collectedAmount;
  final String currency;
  final double minimumDonation;
  final List<double> suggestedAmounts;
  final String bannerImage;
  final String thumbnail;
  final DateTime startDate;
  final DateTime? endDate;
  final bool isFeatured;
  final bool isActive;
  final bool taxBenefit;

  const DonationCampaignEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.category,
    required this.goalAmount,
    required this.collectedAmount,
    required this.currency,
    required this.minimumDonation,
    required this.suggestedAmounts,
    required this.bannerImage,
    required this.thumbnail,
    required this.startDate,
    this.endDate,
    required this.isFeatured,
    required this.isActive,
    required this.taxBenefit,
  });
}
