import '../../domain/entities/donation_entity.dart';
import '../../domain/entities/donation_campaign_entity.dart';
import '../../domain/entities/donation_receipt_entity.dart';
import '../../domain/entities/donation_history_entity.dart';
import '../../domain/entities/donation_preference_entity.dart';
import '../../domain/entities/donation_filter_entity.dart';

abstract class DonationDataSource {
  Future<List<DonationCampaignEntity>> getDonationCampaigns(DonationFilterEntity filter);
  Future<DonationCampaignEntity> getCampaignDetails(String id);
  Future<List<DonationHistoryEntity>> getDonationHistory();
  Future<DonationEntity> createDonationIntent(String campaignId, double amount, String currency);
  Future<void> cancelDonationIntent(String donationId);
  Future<DonationReceiptEntity> getDonationReceipt(String receiptId);
  Future<String> downloadDonationReceipt(String receiptId);
  Future<DonationPreferenceEntity> getDonationPreferences();
  Future<void> updateDonationPreference(DonationPreferenceEntity preference);
}
