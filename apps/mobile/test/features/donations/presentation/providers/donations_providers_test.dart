import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/donations/presentation/providers/donations_providers.dart';
import '../../../../helpers/mock_donation_data_source.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

void main() {
  test('DonationsNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        donationDataSourceProvider.overrideWithValue(MockDonationDataSource()),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(donationsProvider);
    expect(state.isLoading, true);

    await container.read(donationsProvider.notifier).loadData();
    state = container.read(donationsProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.campaigns, isNotEmpty);
    expect(state.featuredCampaigns, isNotEmpty);
  });
}
