import 'package:flutter/material.dart';
import '../../../../shared/theme/app_spacing.dart';

import '../../../../l10n/gen/app_localizations.dart';

class FilterBottomSheet extends StatelessWidget {
  const FilterBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SafeArea(
      child: Padding(
        padding: AppSpacing.p24,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.filters, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: AppSpacing.sp24),
            Text(l10n.categories),
            // Mock categories
            Wrap(
              spacing: 8,
              children: [
                FilterChip(
                  label: const Text('Meditation'),
                  onSelected: (v) {},
                  selected: false,
                ),
                FilterChip(
                  label: const Text('Philosophy'),
                  onSelected: (v) {},
                  selected: false,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sp16),
            Text(l10n.language),
            Wrap(
              spacing: 8,
              children: [
                FilterChip(
                  label: const Text('Hindi'),
                  onSelected: (v) {},
                  selected: true,
                ),
                FilterChip(
                  label: const Text('English'),
                  onSelected: (v) {},
                  selected: false,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sp24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: Text(l10n.applyFilters),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
