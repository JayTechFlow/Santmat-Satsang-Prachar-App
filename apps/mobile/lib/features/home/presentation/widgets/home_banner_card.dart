import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/featured_banner_entity.dart';

/// Reconstructed HomeBannerCard for Santmat Satsang Prachar Mobile Application.
///
/// Features:
/// 1. Enforces 16:9 widescreen aspect ratio matching Admin CMS.
/// 2. Consumes canonical live banner from Firestore/Storage (no mock data).
/// 3. Devotional fallback decoration if image loading fails.
/// 4. Direct deep navigation to targetRoute on tap.
class HomeBannerCard extends StatelessWidget {
  final FeaturedBannerEntity banner;

  const HomeBannerCard({
    super.key,
    required this.banner,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    final Color borderColor = isDark
        ? const Color(0x33F59E0B)
        : const Color(0x2078350F);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(15.0),
        child: AspectRatio(
          aspectRatio: 16 / 9,
          child: Material(
            color: isDark ? const Color(0xFF1F1D1A) : const Color(0xFFFBF8F2),
            child: InkWell(
              onTap: () {
                final route = banner.targetRoute;
                if (route != null && route.isNotEmpty) {
                  try {
                    context.go(route);
                  } catch (_) {
                    try {
                      context.push(route);
                    } catch (_) {}
                  }
                }
              },
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Banner Image
                  if (banner.imageUrl.isNotEmpty)
                    Image.network(
                      banner.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: isDark
                            ? const Color(0xFF292524)
                            : const Color(0xFFF5F5F4),
                        child: Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.image_outlined,
                                color: isDark
                                    ? Colors.amber.withValues(alpha: 0.5)
                                    : Colors.amber.shade700,
                                size: 36,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'संतमत सत्संग प्रचार',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isDark
                                      ? Colors.grey.shade400
                                      : Colors.grey.shade600,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                  // Bottom Gradient Overlay with Title
                  if (banner.title.isNotEmpty)
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14.0,
                          vertical: 10.0,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.85),
                              Colors.black.withValues(alpha: 0.35),
                              Colors.transparent,
                            ],
                          ),
                        ),
                        child: Text(
                          banner.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13.0,
                            fontWeight: FontWeight.bold,
                            shadows: [
                              Shadow(
                                color: Colors.black54,
                                blurRadius: 4,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
