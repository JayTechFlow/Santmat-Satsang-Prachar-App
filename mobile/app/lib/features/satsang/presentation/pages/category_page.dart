import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../l10n/gen/app_localizations.dart';

class CategoryPage extends ConsumerWidget {
  final String categoryId;

  const CategoryPage({super.key, required this.categoryId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.category)),
      body: const Center(child: Text('Category Details Coming Soon')),
    );
  }
}
