import 'donation_entity.dart';
import 'donation_campaign_entity.dart';

class DonationHistoryEntity {
  final DonationEntity donation;
  final DonationCampaignEntity campaign;

  const DonationHistoryEntity({required this.donation, required this.campaign});
}
