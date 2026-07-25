import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/entities/donation_campaign_entity.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/entities/donation_history_entity.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/entities/donation_receipt_entity.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/entities/donation_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/entities/donation_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/entities/donation_entity.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/repositories/donation_repository.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/usecases/donation_usecases.dart';

class MockDonationRepository implements DonationRepository {
  @override
  Future<Result<List<DonationCampaignEntity>>> getDonationCampaigns(
    DonationFilterEntity filter,
  ) async => const Result.success([]);
  @override
  Future<Result<DonationCampaignEntity>> getCampaignDetails(String id) async =>
      throw UnimplementedError();
  @override
  Future<Result<List<DonationHistoryEntity>>> getDonationHistory() async =>
      const Result.success([]);
  @override
  Future<Result<DonationEntity>> createDonationIntent(
    String campaignId,
    double amount,
    String currency,
  ) async => throw UnimplementedError();
  @override
  Future<Result<void>> cancelDonationIntent(String donationId) async =>
      const Result.success(null);
  @override
  Future<Result<DonationReceiptEntity>> getDonationReceipt(
    String receiptId,
  ) async => throw UnimplementedError();
  @override
  Future<Result<String>> downloadDonationReceipt(String receiptId) async =>
      const Result.success('');
  @override
  Future<Result<DonationPreferenceEntity>> getDonationPreferences() async =>
      throw UnimplementedError();
  @override
  Future<Result<void>> updateDonationPreference(
    DonationPreferenceEntity preference,
  ) async => const Result.success(null);
}

void main() {
  late MockDonationRepository repository;
  late GetDonationCampaignsUseCase getDonationCampaignsUseCase;

  setUp(() {
    repository = MockDonationRepository();
    getDonationCampaignsUseCase = GetDonationCampaignsUseCase(repository);
  });

  test('GetDonationCampaignsUseCase returns success', () async {
    final result = await getDonationCampaignsUseCase(
      const DonationFilterEntity(),
    );
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
