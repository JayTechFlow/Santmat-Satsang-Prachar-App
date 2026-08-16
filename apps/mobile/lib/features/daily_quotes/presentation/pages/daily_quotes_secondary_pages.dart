import 'package:flutter/material.dart';

class QuoteDetailsPage extends StatelessWidget {
  final String quoteId;

  const QuoteDetailsPage({super.key, required this.quoteId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quote Details')),
      body: const Center(child: Text('Quote Details Coming Soon')),
    );
  }
}

class FavoriteQuotesPage extends StatelessWidget {
  const FavoriteQuotesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: const Center(child: Text('Favorites Coming Soon')),
    );
  }
}

class QuoteHistoryPage extends StatelessWidget {
  const QuoteHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('History')),
      body: const Center(child: Text('History Coming Soon')),
    );
  }
}
