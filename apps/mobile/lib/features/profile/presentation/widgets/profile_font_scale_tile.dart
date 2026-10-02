import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';
import '../../../../shared/theme/devanagari_font_scale_provider.dart';

class ProfileFontScaleTile extends ConsumerWidget {
  const ProfileFontScaleTile({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentScale = ref.watch(devanagariFontScaleProvider);
    final percentageText = "${(currentScale * 100).toInt()}%";

    return Padding(
      padding: const EdgeInsets.all(SSPSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Icon(
                      Icons.format_size_outlined,
                      color: SSPColors.textPrimary(context),
                      size: 22,
                    ),
                    const SizedBox(width: SSPSpacing.sm),
                    Flexible(
                      child: Text(
                        'देवनागरी फॉन्ट आकार (Font Scale)',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: SSPTypography.bodyMedium.copyWith(
                          color: SSPColors.textPrimary(context),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary)
                      .withValues(alpha: 0.15),
                  borderRadius: SSPRadius.brSmall,
                ),
                child: Text(
                  percentageText,
                  style: SSPTypography.labelSmall.copyWith(
                    color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: SSPSpacing.xs),
          Row(
            children: [
              const Text('अ', style: TextStyle(fontSize: 12)),
              Expanded(
                child: Slider(
                  value: currentScale.clamp(0.8, 1.4),
                  min: 0.8,
                  max: 1.4,
                  divisions: 6,
                  activeColor: isDark
                      ? SSPColors.darkPrimary
                      : SSPColors.lightPrimary,
                  label: percentageText,
                  onChanged: (newScale) {
                    ref
                        .read(devanagariFontScaleProvider.notifier)
                        .setScale(newScale);
                  },
                ),
              ),
              const Text('अ', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ],
          ),
          Center(
            child: Text(
              '॥ जय गुरुदेव ॥ (Devanagari Preview)',
              style: TextStyle(
                fontSize: 14 * currentScale,
                fontWeight: FontWeight.w500,
                color: SSPColors.textSecondary(context),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
