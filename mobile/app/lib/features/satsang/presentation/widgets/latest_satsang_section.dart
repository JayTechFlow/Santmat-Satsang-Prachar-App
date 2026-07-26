import 'package:flutter/material.dart';
import '../../domain/entities/satsang_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import 'satsang_card.dart';

class LatestSatsangSection extends StatelessWidget {
  final String title;
  final List<SatsangEntity> satsangs;
  final Function(SatsangEntity) onSatsangTap;

  const LatestSatsangSection({
    super.key,
    required this.title,
    required this.satsangs,
    required this.onSatsangTap,
  });

  @override
  Widget build(BuildContext context) {
    if (satsangs.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sp16,
            vertical: AppSpacing.sp8,
          ),
          child: Text(title, style: Theme.of(context).textTheme.titleLarge),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: satsangs.length,
          itemBuilder: (context, index) {
            return SatsangCard(
              satsang: satsangs[index],
              onTap: () => onSatsangTap(satsangs[index]),
            );
          },
        ),
      ],
    );
  }
}
