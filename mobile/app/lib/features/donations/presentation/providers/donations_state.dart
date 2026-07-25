import '../../domain/entities/donation_campaign_entity.dart';
import '../../domain/entities/donation_filter_entity.dart';

class DonationsState {
  final bool isLoading;
  final String? error;
  final List<DonationCampaignEntity> campaigns;
  final List<DonationCampaignEntity> featuredCampaigns;
  final DonationFilterEntity filter;

  const DonationsState({
    this.isLoading = false,
    this.error,
    this.campaigns = const [],
    this.featuredCampaigns = const [],
    this.filter = const DonationFilterEntity(),
  });

  DonationsState copyWith({
    bool? isLoading,
    String? error,
    List<DonationCampaignEntity>? campaigns,
    List<DonationCampaignEntity>? featuredCampaigns,
    DonationFilterEntity? filter,
  }) {
    return DonationsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      campaigns: campaigns ?? this.campaigns,
      featuredCampaigns: featuredCampaigns ?? this.featuredCampaigns,
      filter: filter ?? this.filter,
    );
  }
}
