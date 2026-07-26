import 'package:flutter/material.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../../../shared/theme/app_spacing.dart';

class CategoryChip extends StatelessWidget {
  final SatsangCategoryEntity category;
  final VoidCallback onTap;

  const CategoryChip({super.key, required this.category, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Chip(
        label: Text(category.name),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sp8),
      ),
    );
  }
}
