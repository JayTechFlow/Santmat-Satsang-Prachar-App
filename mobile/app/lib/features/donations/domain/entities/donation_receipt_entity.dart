import 'donation_entity.dart';
import 'donation_campaign_entity.dart';

class DonationReceiptEntity {
  final String receiptId;
  final DonationEntity donation;
  final DonationCampaignEntity campaign;
  final String donorName;
  final String donorEmail;
  final String? taxId;
  final String downloadUrl;

  const DonationReceiptEntity({
    required this.receiptId,
    required this.donation,
    required this.campaign,
    required this.donorName,
    required this.donorEmail,
    this.taxId,
    required this.downloadUrl,
  });
}
