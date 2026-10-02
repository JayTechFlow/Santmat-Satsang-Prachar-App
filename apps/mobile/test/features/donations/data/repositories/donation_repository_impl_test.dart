import 'package:flutter_test/flutter_test.dart';
import '../../../../helpers/mock_donation_data_source.dart';
import 'package:santmat_satsang_prachar/features/donations/data/repositories/donation_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/entities/donation_filter_entity.dart';

void main() {
  late MockDonationDataSource dataSource;
  late DonationRepositoryImpl repository;

  setUp(() {
    dataSource = MockDonationDataSource();
    repository = DonationRepositoryImpl(dataSource);
  });

  test('getDonationCampaigns returns Result.success', () async {
    final result = await repository.getDonationCampaigns(
      const DonationFilterEntity(),
    );
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('createDonationIntent returns a new intent', () async {
    final campaigns = await repository.getDonationCampaigns(
      const DonationFilterEntity(),
    );
    final campaignId = campaigns.data!.first.id;

    final result = await repository.createDonationIntent(
      campaignId,
      100.0,
      'INR',
    );
    expect(result.isSuccess, true);
    expect(result.data!.campaignId, campaignId);
    expect(result.data!.amount, 100.0);
  });
}
