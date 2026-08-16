import '../../../../core/utils/result.dart';
import '../entities/donation_campaign_entity.dart';
import '../entities/donation_history_entity.dart';
import '../entities/donation_receipt_entity.dart';
import '../entities/donation_preference_entity.dart';
import '../entities/donation_filter_entity.dart';
import '../entities/donation_entity.dart';

abstract class DonationRepository {
  Future<Result<List<DonationCampaignEntity>>> getDonationCampaigns(
    DonationFilterEntity filter,
  );
  Future<Result<DonationCampaignEntity>> getCampaignDetails(String id);
  Future<Result<List<DonationHistoryEntity>>> getDonationHistory();
  Future<Result<DonationEntity>> createDonationIntent(
    String campaignId,
    double amount,
    String currency,
  );
  Future<Result<void>> cancelDonationIntent(String donationId);
  Future<Result<DonationReceiptEntity>> getDonationReceipt(String receiptId);
  Future<Result<String>> downloadDonationReceipt(String receiptId);
  Future<Result<DonationPreferenceEntity>> getDonationPreferences();
  Future<Result<void>> updateDonationPreference(
    DonationPreferenceEntity preference,
  );
}
