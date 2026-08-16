import 'package:flutter/material.dart';

class BookCategoryPage extends StatelessWidget {
  final String categoryId;

  const BookCategoryPage({super.key, required this.categoryId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Category')),
      body: const Center(child: Text('Category Books Coming Soon')),
    );
  }
}

class BookmarksPage extends StatelessWidget {
  const BookmarksPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bookmarks')),
      body: const Center(child: Text('Bookmarks Coming Soon')),
    );
  }
}

class ReadingHistoryPage extends StatelessWidget {
  const ReadingHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reading History')),
      body: const Center(child: Text('History Coming Soon')),
    );
  }
}
