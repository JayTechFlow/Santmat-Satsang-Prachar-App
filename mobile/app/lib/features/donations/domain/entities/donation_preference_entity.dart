class DonationPreferenceEntity {
  final bool monthlyReminders;
  final bool taxReceiptsEmails;
  final String preferredCurrency;
  final bool anonymousDonation;

  const DonationPreferenceEntity({
    required this.monthlyReminders,
    required this.taxReceiptsEmails,
    required this.preferredCurrency,
    required this.anonymousDonation,
  });
}
