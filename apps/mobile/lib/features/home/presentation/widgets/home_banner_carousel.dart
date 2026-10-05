import 'dart:async';
import 'package:flutter/material.dart';
import '../../domain/entities/featured_banner_entity.dart';
import 'home_banner_card.dart';

/// 4-Slot Canonical Home Screen Banner Carousel for Santmat Satsang Prachar.
///
/// Features:
/// 1. Canonical 16:9 Aspect Ratio locked.
/// 2. If 0 banners: returns SizedBox.shrink() (Zero fake/mock banners).
/// 3. If 1 banner: displays single HomeBannerCard without carousel dots/timer.
/// 4. If 2..4 banners:
///    - Horizontal PageView with smooth slide animation.
///    - 5-second auto-scroll interval.
///    - Touch-pause: timer halts while the user is actively interacting/touching.
///    - Smooth animated dot indicators.
///    - Deterministic order (Slot 1 -> Slot 4).
class HomeBannerCarousel extends StatefulWidget {
  final List<FeaturedBannerEntity> banners;

  const HomeBannerCarousel({
    super.key,
    required this.banners,
  });

  @override
  State<HomeBannerCarousel> createState() => _HomeBannerCarouselState();
}

class _HomeBannerCarouselState extends State<HomeBannerCarousel> {
  late final PageController _pageController;
  Timer? _timer;
  int _currentIndex = 0;
  bool _isUserInteracting = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startAutoScroll();
  }

  @override
  void didUpdateWidget(covariant HomeBannerCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.banners.length != widget.banners.length) {
      if (_currentIndex >= widget.banners.length) {
        _currentIndex = 0;
      }
      _resetTimer();
    }
  }

  void _startAutoScroll() {
    if (widget.banners.length <= 1) return;

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!_isUserInteracting && mounted && widget.banners.length > 1) {
        final nextPage = (_currentIndex + 1) % widget.banners.length;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  void _resetTimer() {
    _timer?.cancel();
    _startAutoScroll();
  }

  void _onPointerDown() {
    setState(() {
      _isUserInteracting = true;
    });
  }

  void _onPointerUp() {
    setState(() {
      _isUserInteracting = false;
    });
    _resetTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) {
      return const SizedBox.shrink();
    }

    if (widget.banners.length == 1) {
      return HomeBannerCard(banner: widget.banners.first);
    }

    return Listener(
      onPointerDown: (_) => _onPointerDown(),
      onPointerUp: (_) => _onPointerUp(),
      onPointerCancel: (_) => _onPointerUp(),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 16:9 Carousel PageView
          AspectRatio(
            aspectRatio: 16 / 9,
            child: PageView.builder(
              controller: _pageController,
              itemCount: widget.banners.length,
              onPageChanged: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              itemBuilder: (context, index) {
                final banner = widget.banners[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.0),
                  child: HomeBannerCard(banner: banner),
                );
              },
            ),
          ),

          const SizedBox(height: 8.0),

          // Animated Dot Indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.banners.length, (index) {
              final bool isActive = index == _currentIndex;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                margin: const EdgeInsets.symmetric(horizontal: 3.0),
                height: 5.0,
                width: isActive ? 18.0 : 6.0,
                decoration: BoxDecoration(
                  color: isActive
                      ? const Color(0xFFD97706) // Warm devotional amber
                      : Theme.of(context).brightness == Brightness.dark
                          ? const Color(0x559CA3AF)
                          : const Color(0x4078350F),
                  borderRadius: BorderRadius.circular(3.0),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
