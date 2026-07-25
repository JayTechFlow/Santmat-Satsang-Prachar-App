import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/donation_entity.dart';
import '../../domain/entities/donation_campaign_entity.dart';
import '../../domain/entities/donation_history_entity.dart';
import '../../domain/entities/donation_receipt_entity.dart';
import '../../domain/entities/donation_preference_entity.dart';
import '../../domain/entities/donation_filter_entity.dart';
import '../models/donation_dto.dart';
import 'donation_data_source.dart';

class FirestoreDonationDataSource implements DonationDataSource {
  final FirestoreService _firestoreService;

  FirestoreDonationDataSource(this._firestoreService);

  @override
  Future<List<DonationCampaignEntity>> getDonationCampaigns(DonationFilterEntity filter) async {
    final snapshot = await _firestoreService.getCollection(FirestoreCollections.donations); // Assuming donations collection holds campaigns, or maybe there's a campaigns collection.
    // Let's assume FirestoreCollections.donations holds campaigns for now, or we can use 'donation_campaigns'.
    // Wait, FirestoreCollections only has 'donations'. Let's use it for campaigns.
    var results = snapshot.docs
        .map((doc) => DonationCampaignDto.fromFirestore(doc))
        .where((c) => c.isActive)
        .toList();

    if (filter.isFeatured != null) {
      results = results.where((c) => c.isFeatured == filter.isFeatured).toList();
    }
    if (filter.categoryId != null) {
      results = results.where((c) => c.category.id == filter.categoryId).toList();
    }

    return results;
  }

  @override
  Future<DonationCampaignEntity> getCampaignDetails(String id) async {
    final doc = await _firestoreService.getDocument(FirestoreCollections.donations, id);
    return DonationCampaignDto.fromFirestore(doc);
  }

  @override
  Future<List<DonationHistoryEntity>> getDonationHistory() async {
    // For simplicity, fetch donations intent and campaigns, then join.
    // In a real app, there would be a user's donations collection.
    return [];
  }

  @override
  Future<DonationEntity> createDonationIntent(String campaignId, double amount, String currency) async {
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
    // In a real app, this would create a payment intent on backend and save it to firestore
    return intent;
  }

  @override
  Future<void> cancelDonationIntent(String donationId) async {
    // No-op or delete from firestore
  }

  @override
  Future<DonationReceiptEntity> getDonationReceipt(String receiptId) async {
    throw UnimplementedError('getDonationReceipt not fully implemented for Firestore');
  }

  @override
  Future<String> downloadDonationReceipt(String receiptId) async {
    return '/storage/emulated/0/Download/receipt_$receiptId.pdf';
  }

  @override
  Future<DonationPreferenceEntity> getDonationPreferences() async {
    try {
      final doc = await _firestoreService.getDocument(FirestoreCollections.preferences, 'donations');
      if (!doc.exists) {
        return const DonationPreferenceEntity(
          monthlyReminders: false,
          taxReceiptsEmails: true,
          preferredCurrency: 'INR',
          anonymousDonation: false,
        );
      }
      final data = doc.data() as Map<String, dynamic>;
      return DonationPreferenceEntity(
        monthlyReminders: data['monthlyReminders'] as bool? ?? false,
        taxReceiptsEmails: data['taxReceiptsEmails'] as bool? ?? true,
        preferredCurrency: data['preferredCurrency'] as String? ?? 'INR',
        anonymousDonation: data['anonymousDonation'] as bool? ?? false,
      );
    } catch (e) {
      return const DonationPreferenceEntity(
        monthlyReminders: false,
        taxReceiptsEmails: true,
        preferredCurrency: 'INR',
        anonymousDonation: false,
      );
    }
  }

  @override
  Future<void> updateDonationPreference(DonationPreferenceEntity preference) async {
    final data = {
      'monthlyReminders': preference.monthlyReminders,
      'taxReceiptsEmails': preference.taxReceiptsEmails,
      'preferredCurrency': preference.preferredCurrency,
      'anonymousDonation': preference.anonymousDonation,
    };
    
    try {
      final doc = await _firestoreService.getDocument(FirestoreCollections.preferences, 'donations');
      if (doc.exists) {
        await _firestoreService.updateDocument(FirestoreCollections.preferences, 'donations', data);
      } else {
        await FirebaseFirestore.instance.collection(FirestoreCollections.preferences).doc('donations').set(data);
      }
    } catch (_) {
      await FirebaseFirestore.instance.collection(FirestoreCollections.preferences).doc('donations').set(data);
    }
  }
}
