import 'package:flutter/material.dart';

class DonationDetailsPage extends StatelessWidget {
  final String campaignId;

  const DonationDetailsPage({super.key, required this.campaignId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Campaign Details')),
      body: const Center(child: Text('Campaign Details Coming Soon')),
    );
  }
}

class DonationCheckoutPage extends StatelessWidget {
  final String campaignId;

  const DonationCheckoutPage({super.key, required this.campaignId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: const Center(child: Text('Checkout Coming Soon')),
    );
  }
}

class DonationHistoryPage extends StatelessWidget {
  const DonationHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Donation History')),
      body: const Center(child: Text('Donation History Coming Soon')),
    );
  }
}

class DonationReceiptPage extends StatelessWidget {
  final String receiptId;

  const DonationReceiptPage({super.key, required this.receiptId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Donation Receipt')),
      body: const Center(child: Text('Donation Receipt Coming Soon')),
    );
  }
}
