import 'package:flutter/material.dart';
import '../../../../../shared/theme/app_spacing.dart';
import '../../../../../shared/theme/app_radius.dart';
import '../../domain/entities/featured_banner_entity.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

class FeaturedBannerCarousel extends StatelessWidget {
  final List<FeaturedBannerEntity> banners;

  const FeaturedBannerCarousel({super.key, required this.banners});

  @override
  Widget build(BuildContext context) {
    if (banners.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 180,
      child: PageView.builder(
        controller: PageController(viewportFraction: 0.9),
        itemCount: banners.length,
        itemBuilder: (context, index) {
          final banner = banners[index];
          return GestureDetector(
            onTap: () {
              if (banner.targetRoute != null && banner.targetRoute!.isNotEmpty) {
                // Determine if it's a route path or an external URL
                if (banner.targetRoute!.startsWith('/')) {
                  context.push(banner.targetRoute!);
                } else if (banner.targetRoute!.startsWith('http')) {
                  // External URL handling could be here, not using new plugins.
                  debugPrint('Open URL: \${banner.targetRoute}');
                }
              }
            },
            child: Container(
              margin: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sp4,
                vertical: AppSpacing.sp8,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    SSPImage(
                      banner.imageUrl,
                      fit: BoxFit.cover,
                    ),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.black.withAlpha(153), Colors.transparent],
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                        ),
                      ),
                      padding: const EdgeInsets.all(AppSpacing.sp16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Text(
                              banner.title,
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.share, color: Colors.white),
                            onPressed: () {
                              // ignore: deprecated_member_use
                              Share.share('Check out: \${banner.title}\\n\${banner.imageUrl}');
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
