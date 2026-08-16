import '../../../../core/utils/result.dart';
import '../entities/donation_campaign_entity.dart';
import '../entities/donation_history_entity.dart';
import '../entities/donation_receipt_entity.dart';
import '../entities/donation_preference_entity.dart';
import '../entities/donation_filter_entity.dart';
import '../entities/donation_entity.dart';
import '../repositories/donation_repository.dart';

class GetDonationCampaignsUseCase {
  final DonationRepository repository;
  GetDonationCampaignsUseCase(this.repository);
  Future<Result<List<DonationCampaignEntity>>> call(
    DonationFilterEntity filter,
  ) => repository.getDonationCampaigns(filter);
}

class GetCampaignDetailsUseCase {
  final DonationRepository repository;
  GetCampaignDetailsUseCase(this.repository);
  Future<Result<DonationCampaignEntity>> call(String id) =>
      repository.getCampaignDetails(id);
}

class GetDonationHistoryUseCase {
  final DonationRepository repository;
  GetDonationHistoryUseCase(this.repository);
  Future<Result<List<DonationHistoryEntity>>> call() =>
      repository.getDonationHistory();
}

class CreateDonationIntentUseCase {
  final DonationRepository repository;
  CreateDonationIntentUseCase(this.repository);
  Future<Result<DonationEntity>> call(
    String campaignId,
    double amount,
    String currency,
  ) => repository.createDonationIntent(campaignId, amount, currency);
}

class CancelDonationIntentUseCase {
  final DonationRepository repository;
  CancelDonationIntentUseCase(this.repository);
  Future<Result<void>> call(String donationId) =>
      repository.cancelDonationIntent(donationId);
}

class GetDonationReceiptUseCase {
  final DonationRepository repository;
  GetDonationReceiptUseCase(this.repository);
  Future<Result<DonationReceiptEntity>> call(String receiptId) =>
      repository.getDonationReceipt(receiptId);
}

class DownloadDonationReceiptUseCase {
  final DonationRepository repository;
  DownloadDonationReceiptUseCase(this.repository);
  Future<Result<String>> call(String receiptId) =>
      repository.downloadDonationReceipt(receiptId);
}

class GetDonationPreferencesUseCase {
  final DonationRepository repository;
  GetDonationPreferencesUseCase(this.repository);
  Future<Result<DonationPreferenceEntity>> call() =>
      repository.getDonationPreferences();
}

class UpdateDonationPreferenceUseCase {
  final DonationRepository repository;
  UpdateDonationPreferenceUseCase(this.repository);
  Future<Result<void>> call(DonationPreferenceEntity preference) =>
      repository.updateDonationPreference(preference);
}
