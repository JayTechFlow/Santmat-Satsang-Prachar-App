import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/theme/app_spacing.dart';
import '../../../../../shared/theme/app_radius.dart';
import '../../../../../l10n/gen/app_localizations.dart';
import '../../domain/entities/quick_action_entity.dart';

class QuickActionsGrid extends StatelessWidget {
  final List<QuickActionEntity> actions;

  const QuickActionsGrid({super.key, required this.actions});

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'menu_book':
        return Icons.menu_book;
      case 'volunteer_activism':
        return Icons.volunteer_activism;
      case 'live_tv':
        return Icons.live_tv;
      case 'headphones':
        return Icons.headphones;
      default:
        return Icons.star;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (actions.isEmpty) return const SizedBox.shrink();

    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sp16,
        vertical: AppSpacing.sp8,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.quickActions,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.sp8),
          LayoutBuilder(
            builder: (context, constraints) {
              final crossAxisCount = constraints.maxWidth > 600 ? 8 : 4;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxisCount,
                  crossAxisSpacing: AppSpacing.sp8,
                  mainAxisSpacing: AppSpacing.sp8,
                  childAspectRatio: 0.8,
                ),
                itemCount: actions.length,
                itemBuilder: (context, index) {
                  final action = actions[index];
                  return InkWell(
                    onTap: () {
                      if (action.route.isNotEmpty) {
                        context.push(action.route);
                      }
                    },
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.sp16),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primaryContainer,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _getIconData(action.iconName),
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sp4),
                        Text(
                          action.title,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
