import '../../domain/entities/donation_entity.dart';
import '../../domain/entities/donation_campaign_entity.dart';
import '../../domain/entities/donation_category_entity.dart';
import '../../domain/entities/donation_receipt_entity.dart';
import '../../domain/entities/donation_history_entity.dart';
import '../../domain/entities/donation_preference_entity.dart';
import '../../domain/entities/donation_filter_entity.dart';
import 'donation_data_source.dart';

class MockDonationDataSource implements DonationDataSource {
  final List<DonationCategoryEntity> _categories = [
    const DonationCategoryEntity(id: 'c1', name: 'Ashram Construction'),
    const DonationCategoryEntity(
      id: 'c2',
      name: 'Food Distribution (Bhandara)',
    ),
    const DonationCategoryEntity(id: 'c3', name: 'General Fund'),
  ];

  late List<DonationCampaignEntity> _campaigns;
  final List<DonationHistoryEntity> _history = [];
  final List<DonationEntity> _intents = [];
  late DonationPreferenceEntity _preferences;

  MockDonationDataSource() {
    _campaigns = List.generate(5, (index) {
      return DonationCampaignEntity(
        id: 'camp_$index',
        title: 'Support Cause $index',
        subtitle: 'Help us reach our goal',
        description:
            'Your contribution helps us continue our spiritual and community services. Thank you for your generosity.',
        category: _categories[index % _categories.length],
        goalAmount: 100000.0 * (index + 1),
        collectedAmount: 25000.0 * (index + 1),
        currency: 'INR',
        minimumDonation: 100.0,
        suggestedAmounts: const [501.0, 1100.0, 2100.0, 5100.0],
        bannerImage: 'https://picsum.photos/seed/camp_banner_$index/600/300',
        thumbnail: 'https://picsum.photos/seed/camp_thumb_$index/200/200',
        startDate: DateTime.now().subtract(const Duration(days: 30)),
        isFeatured: index == 0,
        isActive: true,
        taxBenefit: true,
      );
    });

    _preferences = const DonationPreferenceEntity(
      monthlyReminders: false,
      taxReceiptsEmails: true,
      preferredCurrency: 'INR',
      anonymousDonation: false,
    );
  }

  Future<List<DonationCampaignEntity>> getDonationCampaigns(
    DonationFilterEntity filter,
  ) async {
    await Future.delayed(const Duration(milliseconds: 300));
    var results = _campaigns.where((c) => c.isActive).toList();

    if (filter.isFeatured != null) {
      results = results
          .where((c) => c.isFeatured == filter.isFeatured)
          .toList();
    }
    if (filter.categoryId != null) {
      results = results
          .where((c) => c.category.id == filter.categoryId)
          .toList();
    }

    return results;
  }

  Future<DonationCampaignEntity> getCampaignDetails(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _campaigns.firstWhere((c) => c.id == id);
  }

  Future<List<DonationHistoryEntity>> getDonationHistory() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _history;
  }

  Future<DonationEntity> createDonationIntent(
    String campaignId,
    double amount,
    String currency,
  ) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final intent = DonationEntity(
      id: 'don_${DateTime.now().millisecondsSinceEpoch}',
      campaignId: campaignId,
      amount: amount,
      currency: currency,
      date: DateTime.now(),
      status: 'pending',
      paymentMethod: 'UPI',
      transactionId: '',
    );
    _intents.add(intent);

    // Mock automatic success for demo purposes
    Future.delayed(const Duration(seconds: 2), () {
      final index = _intents.indexWhere((i) => i.id == intent.id);
      if (index != -1) {
        final successIntent = DonationEntity(
          id: intent.id,
          campaignId: intent.campaignId,
          amount: intent.amount,
          currency: intent.currency,
          date: intent.date,
          status: 'success',
          paymentMethod: intent.paymentMethod,
          transactionId: 'txn_${DateTime.now().millisecondsSinceEpoch}',
        );
        _intents[index] = successIntent;
        final campaign = _campaigns.firstWhere((c) => c.id == campaignId);
        _history.add(
          DonationHistoryEntity(donation: successIntent, campaign: campaign),
        );
      }
    });

    return intent;
  }

  Future<void> cancelDonationIntent(String donationId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _intents.removeWhere((i) => i.id == donationId);
  }

  Future<DonationReceiptEntity> getDonationReceipt(String receiptId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final historyItem = _history.firstWhere(
      (h) => 'rec_${h.donation.id}' == receiptId,
    );
    return DonationReceiptEntity(
      receiptId: receiptId,
      donation: historyItem.donation,
      campaign: historyItem.campaign,
      donorName: 'Devotee',
      donorEmail: 'devotee@example.com',
      taxId: historyItem.campaign.taxBenefit ? 'PAN1234567' : null,
      downloadUrl: 'https://example.com/receipts/$receiptId.pdf',
    );
  }

  Future<String> downloadDonationReceipt(String receiptId) async {
    await Future.delayed(const Duration(seconds: 1));
    return '/storage/emulated/0/Download/receipt_$receiptId.pdf';
  }

  Future<DonationPreferenceEntity> getDonationPreferences() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _preferences;
  }

  Future<void> updateDonationPreference(
    DonationPreferenceEntity preference,
  ) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _preferences = preference;
  }
}
