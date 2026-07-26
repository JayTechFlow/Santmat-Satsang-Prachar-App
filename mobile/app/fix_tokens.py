import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # AppRadius
    content = content.replace('AppRadius.borderRadiusLg', 'AppRadius.brLg')
    content = content.replace('AppRadius.borderRadiusMd', 'AppRadius.brMd')
    content = content.replace('AppRadius.borderRadiusSm', 'AppRadius.brSm')
    content = content.replace('AppRadius.borderRadiusXl', 'AppRadius.brXl')
    content = content.replace('AppRadius.borderRadiusXxl', 'AppRadius.brXxl')
    content = content.replace('AppRadius.radiusMd', 'AppRadius.md')
    content = content.replace('AppRadius.radiusSm', 'AppRadius.sm')
    content = content.replace('AppRadius.radiusLg', 'AppRadius.lg')
    content = content.replace('AppRadius.radiusXl', 'AppRadius.xl')

    # AppSpacing - Gaps
    content = content.replace('AppSpacing.verticalSpaceXs', 'AppSpacing.gapH4')
    content = content.replace('AppSpacing.verticalSpaceSm', 'AppSpacing.gapH8')
    content = content.replace('AppSpacing.verticalSpaceMd', 'AppSpacing.gapH16')
    content = content.replace('AppSpacing.verticalSpaceLg', 'AppSpacing.gapH24')
    content = content.replace('AppSpacing.verticalSpaceXl', 'AppSpacing.gapH32')
    content = content.replace('AppSpacing.verticalSpaceXxlg', 'AppSpacing.gapH48')
    content = content.replace('AppSpacing.horizontalSpaceXs', 'AppSpacing.gapW4')
    content = content.replace('AppSpacing.horizontalSpaceSm', 'AppSpacing.gapW8')
    content = content.replace('AppSpacing.horizontalSpaceMd', 'AppSpacing.gapW16')
    content = content.replace('AppSpacing.horizontalSpaceLg', 'AppSpacing.gapW24')

    # AppSpacing - Paddings
    content = content.replace('AppSpacing.paddingAllXs', 'AppSpacing.p4')
    content = content.replace('AppSpacing.paddingAllSm', 'AppSpacing.p8')
    content = content.replace('AppSpacing.paddingAllMd', 'AppSpacing.p16')
    content = content.replace('AppSpacing.paddingAllLg', 'AppSpacing.p24')
    content = content.replace('AppSpacing.paddingAllXl', 'AppSpacing.p32')

    # AppSpacing constants used directly in EdgeInsets or SizedBox
    content = content.replace('AppSpacing.xs', 'AppSpacing.sp4')
    content = content.replace('AppSpacing.sm', 'AppSpacing.sp8')
    content = content.replace('AppSpacing.md', 'AppSpacing.sp16')
    content = content.replace('AppSpacing.lg', 'AppSpacing.sp24')
    content = content.replace('AppSpacing.xl', 'AppSpacing.sp32')
    content = content.replace('AppSpacing.xxlg', 'AppSpacing.sp48')

    # AppTypography
    content = content.replace('AppTypography.displayLarge', 'AppTypography.display')
    content = content.replace('AppTypography.headlineMedium', 'AppTypography.headline')
    content = content.replace('AppTypography.titleLarge', 'AppTypography.title')
    content = content.replace('AppTypography.titleMedium', 'AppTypography.subtitle')
    content = content.replace('AppTypography.bodyLarge', 'AppTypography.body')
    content = content.replace('AppTypography.bodyMedium', 'AppTypography.body')
    content = content.replace('AppTypography.bodySmall', 'AppTypography.caption')
    content = content.replace('AppTypography.labelLarge', 'AppTypography.button')
    content = content.replace('AppTypography.labelMedium', 'AppTypography.label')
    content = content.replace('AppTypography.labelSmall', 'AppTypography.label')

    # AppColors
    content = content.replace('AppColors.lightPrimary', 'AppColors.deepSaffron')
    content = content.replace('AppColors.lightOnPrimary', 'Colors.white')
    content = content.replace('AppColors.lightSurface', 'AppColors.softWhite')
    content = content.replace('AppColors.lightOnSurface', 'AppColors.warmBlack')
    content = content.replace('AppColors.darkSurface', 'AppColors.deepCharcoal')
    content = content.replace('AppColors.darkOnSurface', 'AppColors.softWhite')
    content = content.replace('AppColors.lightOnSurfaceVariant', 'AppColors.templeBrown')
    content = content.replace('AppColors.onSurfaceVariant', 'textMuted(context)')
    content = content.replace('AppColors.templeGold', 'AppColors.sacredGold')
    content = content.replace('AppColors.maroon', 'AppColors.templeBrown')
    
    # Shadows
    content = content.replace('AppShadows.md', 'AppShadows.medium(context)')
    content = content.replace('AppShadows.lg', 'AppShadows.large(context)')
    content = content.replace('AppShadows.sm', 'AppShadows.soft(context)')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('lib'):
    for file in files:
        if file.endswith('.dart'):
            process_file(os.path.join(root, file))
