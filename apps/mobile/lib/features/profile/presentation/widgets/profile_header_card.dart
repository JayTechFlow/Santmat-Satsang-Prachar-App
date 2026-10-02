import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/phone_number_utils.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';
import '../../domain/entities/user_profile_entity.dart';
import 'profile_avatar.dart';
import 'profile_image_picker_sheet.dart';

class ProfileHeaderCard extends ConsumerWidget {
  final UserProfileEntity profile;
  final VoidCallback onEditProfile;

  const ProfileHeaderCard({
    super.key,
    required this.profile,
    required this.onEditProfile,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: SSPSpacing.md,
        vertical: SSPSpacing.sm,
      ),
      padding: const EdgeInsets.all(SSPSpacing.md),
      decoration: BoxDecoration(
        color: isDark ? SSPColors.darkSurface : SSPColors.lightSurface,
        borderRadius: SSPRadius.brLarge,
        border: Border.all(
          color: isDark ? SSPColors.darkOutline : SSPColors.lightOutline,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Avatar with camera edit badge
          ProfileAvatar(
            profile: profile,
            size: 76,
            isEditable: true,
            onEditPressed: () => ProfileImagePickerSheet.show(
              context: context,
              ref: ref,
              hasCustomPhoto: profile.hasCustomPhoto,
            ),
          ),

          const SizedBox(width: SSPSpacing.md),

          // User Info area
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  profile.name.isNotEmpty ? profile.name : 'सत्संग प्रेमी',
                  style: SSPTypography.titleLarge.copyWith(
                    color: SSPColors.textPrimary(context),
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (profile.email != null && profile.email!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(
                        Icons.email_outlined,
                        size: 13,
                        color: SSPColors.textSecondary(context),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          profile.email!,
                          style: SSPTypography.bodySmall.copyWith(
                            color: SSPColors.textSecondary(context),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
                if (profile.phone != null && profile.phone!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(
                        Icons.phone_outlined,
                        size: 13,
                        color: SSPColors.textSecondary(context),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          PhoneNumberUtils.formatDisplay(profile.phone!),
                          style: SSPTypography.bodySmall.copyWith(
                            color: SSPColors.textSecondary(context),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: SSPSpacing.xs),

                // Role Badge ("सत्संग सदस्य")
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: SSPSpacing.sm,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: isDark
                        ? SSPColors.darkPrimary.withValues(alpha: 0.15)
                        : SSPColors.lightPrimary.withValues(alpha: 0.12),
                    borderRadius: SSPRadius.brPill,
                    border: Border.all(
                      color: isDark
                          ? SSPColors.darkPrimary.withValues(alpha: 0.4)
                          : SSPColors.lightPrimary.withValues(alpha: 0.4),
                    ),
                  ),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.verified_user_rounded,
                          size: 12,
                          color: isDark
                              ? SSPColors.darkPrimary
                              : SSPColors.lightPrimary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'सत्संग सदस्य',
                          style: SSPTypography.labelSmall.copyWith(
                            color: isDark
                                ? SSPColors.darkPrimary
                                : SSPColors.lightPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Edit action button
          IconButton(
            onPressed: onEditProfile,
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'प्रोफ़ाइल संपादित करें (Edit Profile)',
            color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
          ),
        ],
      ),
    );
  }
}
