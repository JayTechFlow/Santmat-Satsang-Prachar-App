class DonationEntity {
  final String id;
  final String campaignId;
  final double amount;
  final String currency;
  final DateTime date;
  final String status;
  final String paymentMethod;
  final String transactionId;

  const DonationEntity({
    required this.id,
    required this.campaignId,
    required this.amount,
    required this.currency,
    required this.date,
    required this.status,
    required this.paymentMethod,
    required this.transactionId,
  });
}
