import 'package:flutter/material.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import 'category_chip.dart';

class CategorySection extends StatelessWidget {
  final String title;
  final List<SatsangCategoryEntity> categories;
  final Function(SatsangCategoryEntity) onCategoryTap;

  const CategorySection({
    super.key,
    required this.title,
    required this.categories,
    required this.onCategoryTap,
  });

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          child: Text(title, style: Theme.of(context).textTheme.titleLarge),
        ),
        SizedBox(
          height: 50,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, index) {
              return Center(
                child: CategoryChip(
                  category: categories[index],
                  onTap: () => onCategoryTap(categories[index]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
