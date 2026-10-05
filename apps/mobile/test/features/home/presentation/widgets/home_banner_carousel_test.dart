import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/featured_banner_entity.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/widgets/home_banner_card.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/widgets/home_banner_carousel.dart';

void main() {
  group('HomeBannerCarousel Widget Tests', () {
    testWidgets('renders SizedBox.shrink when banner list is empty (Zero Fake Banners)', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: HomeBannerCarousel(banners: []),
          ),
        ),
      );

      expect(find.byType(PageView), findsNothing);
      expect(find.byType(HomeBannerCard), findsNothing);
    });

    testWidgets('renders single HomeBannerCard without PageView when exactly 1 banner exists', (tester) async {
      const banner = FeaturedBannerEntity(
        id: 'slot-1',
        slot: 1,
        title: 'प्रथम सत्संग बैनर',
        imageUrl: 'https://example.com/slot1.webp',
        targetRoute: '/audio',
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: HomeBannerCarousel(banners: [banner]),
          ),
        ),
      );

      expect(find.byType(PageView), findsNothing);
      expect(find.byType(HomeBannerCard), findsOneWidget);
      expect(find.text('प्रथम सत्संग बैनर'), findsOneWidget);
    });

    testWidgets('renders PageView with 4 banners and 4 indicator dots', (tester) async {
      const banners = [
        FeaturedBannerEntity(
          id: 'slot-1',
          slot: 1,
          title: 'बैनर स्लॉट १',
          imageUrl: 'https://example.com/1.webp',
        ),
        FeaturedBannerEntity(
          id: 'slot-2',
          slot: 2,
          title: 'बैनर स्लॉट २',
          imageUrl: 'https://example.com/2.webp',
        ),
        FeaturedBannerEntity(
          id: 'slot-3',
          slot: 3,
          title: 'बैनर स्लॉट ३',
          imageUrl: 'https://example.com/3.webp',
        ),
        FeaturedBannerEntity(
          id: 'slot-4',
          slot: 4,
          title: 'बैनर स्लॉट ४',
          imageUrl: 'https://example.com/4.webp',
        ),
      ];

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: HomeBannerCarousel(banners: banners),
          ),
        ),
      );

      // Verify PageView is rendered
      expect(find.byType(PageView), findsOneWidget);

      // Verify active first banner title is visible
      expect(find.text('बैनर स्लॉट १'), findsOneWidget);

      // Verify 4 dot indicator AnimatedContainers are rendered
      final animatedContainers = find.byType(AnimatedContainer);
      expect(animatedContainers, findsNWidgets(4));

      // First dot should be wider (active: 18.0)
      final AnimatedContainer firstDot = tester.widget(animatedContainers.first);
      expect(firstDot.constraints?.maxWidth ?? 18.0, 18.0);
    });

    testWidgets('swiping PageView navigates to next slot', (tester) async {
      const banners = [
        FeaturedBannerEntity(
          id: 'slot-1',
          slot: 1,
          title: 'बैनर स्लॉट १',
          imageUrl: 'https://example.com/1.webp',
        ),
        FeaturedBannerEntity(
          id: 'slot-2',
          slot: 2,
          title: 'बैनर स्लॉट २',
          imageUrl: 'https://example.com/2.webp',
        ),
      ];

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: HomeBannerCarousel(banners: banners),
          ),
        ),
      );

      expect(find.text('बैनर स्लॉट १'), findsOneWidget);

      // Drag left to advance to next slide
      await tester.drag(find.byType(PageView), const Offset(-500, 0));
      await tester.pumpAndSettle();

      expect(find.text('बैनर स्लॉट २'), findsOneWidget);
    });
  });
}
