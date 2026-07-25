import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/mock_donation_data_source.dart';
import '../../data/repositories/donation_repository_impl.dart';
import '../../domain/repositories/donation_repository.dart';
import '../../domain/usecases/donation_usecases.dart';
import '../../domain/entities/donation_filter_entity.dart';
import '../../domain/entities/donation_campaign_entity.dart';
import '../../domain/entities/donation_history_entity.dart';
import '../../domain/entities/donation_preference_entity.dart';
import 'donations_state.dart';

import '../../data/datasources/firestore_donation_data_source.dart';
import '../../data/datasources/donation_data_source.dart';
import '../../../../core/di/service_locator_registrations.dart';

final donationDataSourceProvider = Provider<DonationDataSource>((ref) {
  final env = ref.watch(environmentConfigurationProvider);
  if (env.isDev) {
    return MockDonationDataSource();
  }
  return FirestoreDonationDataSource(ref.watch(firestoreServiceProvider));
});

final donationRepositoryProvider = Provider<DonationRepository>((ref) {
  return DonationRepositoryImpl(ref.watch(donationDataSourceProvider));
});

final getDonationCampaignsUseCaseProvider = Provider(
  (ref) => GetDonationCampaignsUseCase(ref.watch(donationRepositoryProvider)),
);
final getCampaignDetailsUseCaseProvider = Provider(
  (ref) => GetCampaignDetailsUseCase(ref.watch(donationRepositoryProvider)),
);
final getDonationHistoryUseCaseProvider = Provider(
  (ref) => GetDonationHistoryUseCase(ref.watch(donationRepositoryProvider)),
);
final createDonationIntentUseCaseProvider = Provider(
  (ref) => CreateDonationIntentUseCase(ref.watch(donationRepositoryProvider)),
);
final cancelDonationIntentUseCaseProvider = Provider(
  (ref) => CancelDonationIntentUseCase(ref.watch(donationRepositoryProvider)),
);
final getDonationReceiptUseCaseProvider = Provider(
  (ref) => GetDonationReceiptUseCase(ref.watch(donationRepositoryProvider)),
);
final downloadDonationReceiptUseCaseProvider = Provider(
  (ref) =>
      DownloadDonationReceiptUseCase(ref.watch(donationRepositoryProvider)),
);
final getDonationPreferencesUseCaseProvider = Provider(
  (ref) => GetDonationPreferencesUseCase(ref.watch(donationRepositoryProvider)),
);
final updateDonationPreferenceUseCaseProvider = Provider(
  (ref) =>
      UpdateDonationPreferenceUseCase(ref.watch(donationRepositoryProvider)),
);

class DonationsNotifier extends Notifier<DonationsState> {
  bool _mounted = true;

  @override
  DonationsState build() {
    ref.onDispose(() => _mounted = false);
    Future.microtask(() {
      if (_mounted) loadData();
    });
    return const DonationsState(isLoading: true);
  }

  Future<void> loadData() async {
    if (!_mounted) return;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final getCampaigns = ref.read(getDonationCampaignsUseCaseProvider);

      final featuredRes = await getCampaigns(
        const DonationFilterEntity(isFeatured: true),
      );
      final allRes = await getCampaigns(state.filter);

      if (!_mounted) return;

      if (featuredRes.isError) throw Exception(featuredRes.error);
      if (allRes.isError) throw Exception(allRes.error);

      state = state.copyWith(
        isLoading: false,
        featuredCampaigns: featuredRes.data,
        campaigns: allRes.data,
      );
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }

  void updateFilter(DonationFilterEntity newFilter) {
    state = state.copyWith(filter: newFilter);
    loadData();
  }
}

final donationsProvider = NotifierProvider<DonationsNotifier, DonationsState>(
  DonationsNotifier.new,
);

final donationHistoryProvider = FutureProvider<List<DonationHistoryEntity>>((
  ref,
) async {
  final getHistory = ref.read(getDonationHistoryUseCaseProvider);
  final res = await getHistory();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

final donationPreferencesProvider = FutureProvider<DonationPreferenceEntity>((
  ref,
) async {
  final getPrefs = ref.read(getDonationPreferencesUseCaseProvider);
  final res = await getPrefs();
  if (res.isError) throw Exception(res.error);
  return res.data!;
});

final campaignDetailsProvider =
    FutureProvider.family<DonationCampaignEntity, String>((ref, id) async {
      final getDetails = ref.read(getCampaignDetailsUseCaseProvider);
      final res = await getDetails(id);
      if (res.isError) throw Exception(res.error);
      return res.data!;
    });
