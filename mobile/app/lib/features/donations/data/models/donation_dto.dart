import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/donation_entity.dart';
import '../../domain/entities/donation_campaign_entity.dart';
import '../../domain/entities/donation_category_entity.dart';

class DonationDto {
  static DonationEntity fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return DonationEntity(
      id: doc.id,
      campaignId: data['campaignId'] as String? ?? '',
      amount: (data['amount'] as num?)?.toDouble() ?? 0.0,
      currency: data['currency'] as String? ?? '',
      date: (data['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
      status: data['status'] as String? ?? '',
      paymentMethod: data['paymentMethod'] as String? ?? '',
      transactionId: data['transactionId'] as String? ?? '',
    );
  }

  static Map<String, dynamic> toFirestore(DonationEntity entity) {
    return {
      'campaignId': entity.campaignId,
      'amount': entity.amount,
      'currency': entity.currency,
      'date': Timestamp.fromDate(entity.date),
      'status': entity.status,
      'paymentMethod': entity.paymentMethod,
      'transactionId': entity.transactionId,
    };
  }
}

class DonationCampaignDto {
  static DonationCampaignEntity fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final categoryData = data['category'] as Map<String, dynamic>? ?? {};

    return DonationCampaignEntity(
      id: doc.id,
      title: data['title'] as String? ?? '',
      subtitle: data['subtitle'] as String? ?? '',
      description: data['description'] as String? ?? '',
      category: DonationCategoryEntity(
        id: categoryData['id'] as String? ?? '',
        name: categoryData['name'] as String? ?? '',
      ),
      goalAmount: (data['goalAmount'] as num?)?.toDouble() ?? 0.0,
      collectedAmount: (data['collectedAmount'] as num?)?.toDouble() ?? 0.0,
      currency: data['currency'] as String? ?? '',
      minimumDonation: (data['minimumDonation'] as num?)?.toDouble() ?? 0.0,
      suggestedAmounts:
          (data['suggestedAmounts'] as List<dynamic>?)
              ?.map((e) => (e as num).toDouble())
              .toList() ??
          [],
      bannerImage: data['bannerImage'] as String? ?? '',
      thumbnail: data['thumbnail'] as String? ?? '',
      startDate: (data['startDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      endDate: (data['endDate'] as Timestamp?)?.toDate(),
      isFeatured: data['isFeatured'] as bool? ?? false,
      isActive: data['isActive'] as bool? ?? false,
      taxBenefit: data['taxBenefit'] as bool? ?? false,
    );
  }

  static Map<String, dynamic> toFirestore(DonationCampaignEntity entity) {
    return {
      'title': entity.title,
      'subtitle': entity.subtitle,
      'description': entity.description,
      'category': {'id': entity.category.id, 'name': entity.category.name},
      'goalAmount': entity.goalAmount,
      'collectedAmount': entity.collectedAmount,
      'currency': entity.currency,
      'minimumDonation': entity.minimumDonation,
      'suggestedAmounts': entity.suggestedAmounts,
      'bannerImage': entity.bannerImage,
      'thumbnail': entity.thumbnail,
      'startDate': Timestamp.fromDate(entity.startDate),
      'endDate': entity.endDate != null
          ? Timestamp.fromDate(entity.endDate!)
          : null,
      'isFeatured': entity.isFeatured,
      'isActive': entity.isActive,
      'taxBenefit': entity.taxBenefit,
    };
  }
}
