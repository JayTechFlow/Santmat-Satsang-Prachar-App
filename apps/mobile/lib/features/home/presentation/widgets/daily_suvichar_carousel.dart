import 'dart:async';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../../domain/entities/suvichar_item.dart';
import 'suvichar_modal.dart';

class DailySuvicharCarousel extends StatefulWidget {
  final List<SuvicharItem> suvichars;

  const DailySuvicharCarousel({super.key, this.suvichars = defaultSuvichars});

  @override
  State<DailySuvicharCarousel> createState() => _DailySuvicharCarouselState();
}

class _DailySuvicharCarouselState extends State<DailySuvicharCarousel> {
  late final PageController _pageController;
  Timer? _autoScrollTimer;
  int _activeIndex = 0;

  List<SuvicharItem> get _items =>
      widget.suvichars.isNotEmpty ? widget.suvichars : defaultSuvichars;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _startAutoScroll();
  }

  void _startAutoScroll() {
    _autoScrollTimer?.cancel();
    _autoScrollTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!mounted || _items.isEmpty) return;
      if (_pageController.hasClients) {
        final nextPage = (_activeIndex + 1) % _items.length;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 450),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  void _resetAutoScroll() {
    _startAutoScroll();
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _openModal(int index) {
    SuvicharModal.show(context, suvichars: _items, initialIndex: index);
  }

  void _shareItem(SuvicharItem item) {
    SharePlus.instance.share(
      ShareParams(
        text: '"${item.quote}" — ${item.author}\n\nसंतमत सत्संग प्रचार',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    if (_items.isEmpty) return const SizedBox.shrink();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Horizontal Carousel Box
        Container(
          height: 220.0,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20.0),
            border: Border.all(
              color: isDark ? const Color(0x33F59E0B) : const Color(0x2078350F),
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(19.0),
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _activeIndex = index;
                });
                _resetAutoScroll();
              },
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];

                return GestureDetector(
                  onTap: () => _openModal(index),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Backdrop Image
                      Image.network(
                        item.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: isDark
                              ? const Color(0xFF292524)
                              : const Color(0xFFF5F5F4),
                          child: const Center(
                            child: Icon(
                              Icons.image_outlined,
                              color: Colors.grey,
                            ),
                          ),
                        ),
                      ),

                      // Gradient Overlay for readability
                      Positioned.fill(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withValues(alpha: 0.15),
                                Colors.black.withValues(alpha: 0.55),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // Top Right Share Action Button
                      Positioned(
                        top: 12.0,
                        right: 12.0,
                        child: Semantics(
                          button: true,
                          label: 'सुविचार शेयर करें',
                          child: GestureDetector(
                            onTap: () => _shareItem(item),
                            child: Container(
                              padding: const EdgeInsets.all(8.0),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.5),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.share_rounded,
                                size: 16.0,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Bottom Left Action Pill Button
                      Positioned(
                        bottom: 12.0,
                        left: 12.0,
                        child: Semantics(
                          button: true,
                          label: 'आज का समाचार एवं विचार देखें',
                          child: GestureDetector(
                            onTap: () => _openModal(index),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14.0,
                                vertical: 6.0,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xD91C1917),
                                borderRadius: BorderRadius.circular(20.0),
                                border: Border.all(
                                  color: const Color(
                                    0xFFF59E0B,
                                  ).withValues(alpha: 0.4),
                                  width: 1.0,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.25),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: const Text(
                                'आज का समाचार एवं विचार देखें →',
                                style: TextStyle(
                                  fontSize: 12.0,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFFCD34D),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),

        const SizedBox(height: 10.0),

        // Indicator Dots
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            _items.length,
            (idx) => GestureDetector(
              onTap: () {
                _pageController.animateToPage(
                  idx,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
                _resetAutoScroll();
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 3.0),
                height: 6.0,
                width: _activeIndex == idx ? 20.0 : 6.0,
                decoration: BoxDecoration(
                  color: _activeIndex == idx
                      ? const Color(0xFFF59E0B)
                      : (isDark
                            ? const Color(0xFF44403C)
                            : const Color(0xFFD6D3D1)),
                  borderRadius: BorderRadius.circular(3.0),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
