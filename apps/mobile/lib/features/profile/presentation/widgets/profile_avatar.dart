import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../domain/entities/user_profile_entity.dart';

class ProfileAvatar extends StatelessWidget {
  final UserProfileEntity? profile;
  final double size;
  final bool isEditable;
  final VoidCallback? onEditPressed;

  const ProfileAvatar({
    super.key,
    required this.profile,
    this.size = 80,
    this.isEditable = false,
    this.onEditPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final photoUrl = profile?.resolvedPhotoUrl;
    final initials = profile?.initials ?? 'सा';
    final hasName = profile != null && profile!.name.trim().isNotEmpty;

    final avatarWidget = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isDark ? SSPColors.darkSurfaceVariant : SSPColors.lightSurfaceVariant,
        border: Border.all(
          color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
          width: 2.5,
        ),
        boxShadow: [
          BoxShadow(
            color: (isDark ? Colors.black : Colors.amber.shade900).withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipOval(
        child: (photoUrl != null && photoUrl.isNotEmpty)
            ? CachedNetworkImage(
                imageUrl: photoUrl,
                width: size,
                height: size,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: isDark ? SSPColors.darkSurfaceVariant : SSPColors.lightSurfaceVariant,
                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator.adaptive(strokeWidth: 2),
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => _buildFallback(isDark, initials, hasName),
              )
            : _buildFallback(isDark, initials, hasName),
      ),
    );

    if (!isEditable) {
      return Semantics(
        label: 'उपयोगकर्ता प्रोफ़ाइल फ़ोटो (${profile?.name ?? ""})',
        child: avatarWidget,
      );
    }

    return Semantics(
      label: 'प्रोफ़ाइल फ़ोटो बदलें',
      button: true,
      child: GestureDetector(
        onTap: onEditPressed,
        child: Stack(
          alignment: Alignment.center,
          children: [
            avatarWidget,
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: EdgeInsets.all(size * 0.06),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
                  border: Border.all(
                    color: isDark ? SSPColors.darkSurface : SSPColors.lightSurface,
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.camera_alt_rounded,
                  size: size * 0.22,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFallback(bool isDark, String initials, bool hasName) {
    if (!hasName) {
      return Center(
        child: Icon(
          Icons.person_outline_rounded,
          size: size * 0.5,
          color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
        ),
      );
    }

    return Center(
      child: Text(
        initials,
        style: TextStyle(
          fontSize: size * 0.42,
          fontWeight: FontWeight.bold,
          color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
        ),
      ),
    );
  }
}
