import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_icons.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';
import 'ssp_app_bar.dart';
import 'ssp_button.dart';
import 'ssp_card.dart';
import 'ssp_glass_container.dart';
import 'ssp_section_header.dart';
import 'ssp_loading.dart';
import 'ssp_empty_state.dart';
import 'ssp_error_state.dart';

/// A preview screen demonstrating all foundational SSP Design System components.
class DesignSystemPreviewScreen extends StatelessWidget {
  const DesignSystemPreviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const SSPAppBar(title: 'Design System Preview'),
      body: ListView(
        padding: AppSpacing.paddingAllLg,
        children: [
          const SSPSectionHeader(title: 'Typography'),
          AppSpacing.verticalSpaceMd,
          Text('Display Large', style: AppTypography.displayLarge),
          Text('Headline Large', style: AppTypography.headlineLarge),
          Text('Title Large', style: AppTypography.titleLarge),
          Text('Body Large', style: AppTypography.bodyLarge),
          AppSpacing.verticalSpaceLg,

          const SSPSectionHeader(title: 'Colors (Semantic)'),
          AppSpacing.verticalSpaceMd,
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              _ColorBox('Primary', Theme.of(context).colorScheme.primary),
              _ColorBox('Secondary', Theme.of(context).colorScheme.secondary),
              _ColorBox('Surface', AppColors.surfaceBackground(context)),
              _ColorBox('Error', Theme.of(context).colorScheme.error),
            ],
          ),
          AppSpacing.verticalSpaceLg,

          const SSPSectionHeader(title: 'Buttons'),
          AppSpacing.verticalSpaceMd,
          SSPButton(
            label: 'Primary Button',
            onPressed: () {},
            icon: AppIcons.play,
          ),
          AppSpacing.verticalSpaceSm,
          SSPButton(
            label: 'Secondary Button',
            variant: SSPButtonVariant.secondary,
            onPressed: () {},
            icon: AppIcons.library,
          ),
          AppSpacing.verticalSpaceSm,
          SSPButton(
            label: 'Outline Button',
            variant: SSPButtonVariant.outline,
            onPressed: () {},
          ),
          AppSpacing.verticalSpaceSm,
          SSPButton(label: 'Loading Button', isLoading: true, onPressed: () {}),
          AppSpacing.verticalSpaceLg,

          const SSPSectionHeader(title: 'Cards & Containers'),
          AppSpacing.verticalSpaceMd,
          SSPCard(
            onTap: () {},
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Standard Card', style: AppTypography.titleLarge),
                AppSpacing.verticalSpaceSm,
                Text(
                  'This is a premium layered card with soft shadows.',
                  style: AppTypography.bodyMedium,
                ),
              ],
            ),
          ),
          AppSpacing.verticalSpaceMd,

          Container(
            height: 150,
            decoration: BoxDecoration(
              image: const DecorationImage(
                image: NetworkImage('https://picsum.photos/400/200'),
                fit: BoxFit.cover,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.center,
            child: SSPGlassContainer(
              padding: AppSpacing.paddingAllMd,
              child: Text(
                'Glassmorphism',
                style: AppTypography.titleLarge.copyWith(color: Colors.white),
              ),
            ),
          ),
          AppSpacing.verticalSpaceLg,

          const SSPSectionHeader(title: 'States'),
          AppSpacing.verticalSpaceMd,
          const SSPCard(
            child: SSPLoading(message: 'Fetching divine content...'),
          ),
          AppSpacing.verticalSpaceMd,
          const SSPCard(
            child: SSPEmptyState(
              title: 'No Downloads',
              message: 'Your downloaded bhajans will appear here.',
              icon: AppIcons.download,
            ),
          ),
          AppSpacing.verticalSpaceMd,
          SSPCard(child: SSPErrorState(onRetry: () {})),
          AppSpacing.verticalSpaceXxlg,
        ],
      ),
    );
  }
}

class _ColorBox extends StatelessWidget {
  final String label;
  final Color color;

  const _ColorBox(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border(context)),
          ),
        ),
        AppSpacing.verticalSpaceXs,
        Text(label, style: AppTypography.labelSmall),
      ],
    );
  }
}
