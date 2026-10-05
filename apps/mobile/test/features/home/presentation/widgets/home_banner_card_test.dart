import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/featured_banner_entity.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/widgets/home_banner_card.dart';

void main() {
  testWidgets('HomeBannerCard renders 16:9 aspect ratio and banner title', (WidgetTester tester) async {
    const banner = FeaturedBannerEntity(
      id: 'test-banner-1',
      title: 'पावन सत्संग महोत्सव',
      imageUrl: 'https://example.com/banner.webp',
      targetRoute: '/audio',
    );

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: HomeBannerCard(banner: banner),
        ),
      ),
    );

    expect(find.text('पावन सत्संग महोत्सव'), findsOneWidget);
    expect(find.byType(AspectRatio), findsOneWidget);

    final AspectRatio aspectRatioWidget = tester.widget(find.byType(AspectRatio));
    expect(aspectRatioWidget.aspectRatio, closeTo(16 / 9, 0.01));
  });

  testWidgets('HomeBannerCard handles empty title gracefully', (WidgetTester tester) async {
    const banner = FeaturedBannerEntity(
      id: 'test-banner-2',
      title: '',
      imageUrl: 'https://example.com/banner_notitle.webp',
      targetRoute: '/audio',
    );

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: HomeBannerCard(banner: banner),
        ),
      ),
    );

    expect(find.byType(AspectRatio), findsOneWidget);
  });
}
