import '../../../../core/utils/result.dart';
import '../../domain/entities/donation_campaign_entity.dart';
import '../../domain/entities/donation_history_entity.dart';
import '../../domain/entities/donation_receipt_entity.dart';
import '../../domain/entities/donation_preference_entity.dart';
import '../../domain/entities/donation_filter_entity.dart';
import '../../domain/entities/donation_entity.dart';
import '../../domain/repositories/donation_repository.dart';
import '../datasources/donation_data_source.dart';

class DonationRepositoryImpl implements DonationRepository {
  final DonationDataSource dataSource;

  DonationRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<DonationCampaignEntity>>> getDonationCampaigns(
    DonationFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.getDonationCampaigns(filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<DonationCampaignEntity>> getCampaignDetails(String id) async {
    try {
      final res = await dataSource.getCampaignDetails(id);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<DonationHistoryEntity>>> getDonationHistory() async {
    try {
      final res = await dataSource.getDonationHistory();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<DonationEntity>> createDonationIntent(
    String campaignId,
    double amount,
    String currency,
  ) async {
    try {
      final res = await dataSource.createDonationIntent(
        campaignId,
        amount,
        currency,
      );
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> cancelDonationIntent(String donationId) async {
    try {
      await dataSource.cancelDonationIntent(donationId);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<DonationReceiptEntity>> getDonationReceipt(
    String receiptId,
  ) async {
    try {
      final res = await dataSource.getDonationReceipt(receiptId);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<String>> downloadDonationReceipt(String receiptId) async {
    try {
      final res = await dataSource.downloadDonationReceipt(receiptId);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<DonationPreferenceEntity>> getDonationPreferences() async {
    try {
      final res = await dataSource.getDonationPreferences();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updateDonationPreference(
    DonationPreferenceEntity preference,
  ) async {
    try {
      await dataSource.updateDonationPreference(preference);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
