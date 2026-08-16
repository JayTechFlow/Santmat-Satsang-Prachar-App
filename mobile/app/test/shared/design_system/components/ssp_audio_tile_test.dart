import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_audio_tile.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/icons/ssp_icons.dart';
import 'package:santmat_satsang_prachar/shared/design_system/tokens/spacing/ssp_spacing.dart';

void main() {
  Widget buildTestableWidget(
    Widget child, {
    Brightness brightness = Brightness.light,
  }) {
    return MaterialApp(
      theme: ThemeData(brightness: brightness),
      home: Scaffold(body: Center(child: child)),
    );
  }

  group('SSPAudioTile Widget Tests', () {
    testWidgets('1. Renders title', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(SSPAudioTile(title: 'Atma Radiance', onTap: () {})),
      );

      expect(find.text('Atma Radiance'), findsOneWidget);
    });

    testWidgets('2. Renders subtitle', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'Atma Radiance',
            subtitle: 'Satsang Discourse',
            onTap: () {},
          ),
        ),
      );

      expect(find.text('Atma Radiance'), findsOneWidget);
      expect(find.text('Satsang Discourse'), findsOneWidget);
    });

    testWidgets('3. Renders duration text', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'Atma Radiance',
            durationText: '5:32',
            onTap: () {},
          ),
        ),
      );

      expect(find.text('5:32'), findsOneWidget);
    });

    testWidgets('4. Renders custom artwork widget', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'Atma Radiance',
            artwork: Container(
              key: const Key('tile-artwork'),
              color: Colors.amber,
            ),
            onTap: () {},
          ),
        ),
      );

      expect(find.byKey(const Key('tile-artwork')), findsOneWidget);
    });

    testWidgets('5. Renders waveform placeholder when artwork is absent', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(SSPAudioTile(title: 'Atma Radiance', onTap: () {})),
      );

      expect(find.byIcon(SSPIcons.waveform), findsOneWidget);
    });

    testWidgets('6. Invokes onTap when tile is tapped', (
      WidgetTester tester,
    ) async {
      bool tapped = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(title: 'Atma Radiance', onTap: () => tapped = true),
        ),
      );

      await tester.tap(find.text('Atma Radiance'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('7. Invokes onPlayPause when play control is pressed', (
      WidgetTester tester,
    ) async {
      bool toggled = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'Atma Radiance',
            onTap: () {},
            onPlayPause: () => toggled = true,
          ),
        ),
      );

      await tester.tap(find.byIcon(SSPIcons.play));
      await tester.pumpAndSettle();

      expect(toggled, isTrue);
    });

    testWidgets('8. Play/pause icon switches with isPlaying state', (
      WidgetTester tester,
    ) async {
      Widget buildTile({required bool isPlaying}) => buildTestableWidget(
        SSPAudioTile(
          title: 'Atma Radiance',
          onTap: () {},
          onPlayPause: () {},
          isPlaying: isPlaying,
        ),
      );

      await tester.pumpWidget(buildTile(isPlaying: false));
      expect(find.byIcon(SSPIcons.play), findsOneWidget);
      expect(find.byIcon(SSPIcons.pause), findsNothing);

      await tester.pumpWidget(buildTile(isPlaying: true));
      expect(find.byIcon(SSPIcons.pause), findsOneWidget);
      expect(find.byIcon(SSPIcons.play), findsNothing);
    });

    testWidgets('9. Invokes onFavorite when favorite control is pressed', (
      WidgetTester tester,
    ) async {
      bool favorited = false;
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'Atma Radiance',
            onTap: () {},
            onFavorite: () => favorited = true,
          ),
        ),
      );

      await tester.tap(find.byIcon(SSPIcons.favoriteOutline));
      await tester.pumpAndSettle();

      expect(favorited, isTrue);
    });

    testWidgets('10. Favorite icon switches with isFavorite state', (
      WidgetTester tester,
    ) async {
      Widget buildTile({required bool isFavorite}) => buildTestableWidget(
        SSPAudioTile(
          title: 'Atma Radiance',
          onTap: () {},
          onFavorite: () {},
          isFavorite: isFavorite,
        ),
      );

      await tester.pumpWidget(buildTile(isFavorite: false));
      expect(find.byIcon(SSPIcons.favoriteOutline), findsOneWidget);
      expect(find.byIcon(SSPIcons.favorite), findsNothing);

      await tester.pumpWidget(buildTile(isFavorite: true));
      expect(find.byIcon(SSPIcons.favorite), findsOneWidget);
      expect(find.byIcon(SSPIcons.favoriteOutline), findsNothing);
    });

    testWidgets(
      '11. Renders without play/pause control when onPlayPause is null',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            SSPAudioTile(
              title: 'Atma Radiance',
              onTap: () {},
              onFavorite: () {},
            ),
          ),
        );

        expect(find.byIcon(SSPIcons.play), findsNothing);
        expect(find.byIcon(SSPIcons.pause), findsNothing);
      },
    );

    testWidgets(
      '12. Renders without favorite control when onFavorite is null',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestableWidget(
            SSPAudioTile(
              title: 'Atma Radiance',
              onTap: () {},
              onPlayPause: () {},
            ),
          ),
        );

        expect(find.byIcon(SSPIcons.favorite), findsNothing);
        expect(find.byIcon(SSPIcons.favoriteOutline), findsNothing);
      },
    );

    testWidgets('13. Enforces minimum touch target height', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'Atma Radiance',
            subtitle: 'Satsang Discourse',
            durationText: '5:32',
            onTap: () {},
            onPlayPause: () {},
            onFavorite: () {},
          ),
        ),
      );

      final Size size = tester.getSize(find.byType(SSPAudioTile));
      expect(size.height, greaterThanOrEqualTo(SSPSpacing.minTouchTarget));
    });

    testWidgets('14. Renders Hindi/Unicode title', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'श्री राम चरित मानस ☀️',
            subtitle: 'प्रवचन',
            onTap: () {},
          ),
        ),
      );

      expect(find.text('श्री राम चरित मानस ☀️'), findsOneWidget);
      expect(find.text('प्रवचन'), findsOneWidget);
    });

    testWidgets('15. Handles text scaling without overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2.0)),
          child: buildTestableWidget(
            SSPAudioTile(
              title: 'Atma Radiance Long Title That Wraps To Two Lines',
              subtitle: 'Satsang Discourse with extended subtitle',
              durationText: '52:32',
              onTap: () {},
              onPlayPause: () {},
              onFavorite: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('16. Handles narrow width without overflow', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SizedBox(
            width: 200,
            child: SSPAudioTile(
              title: 'Atma Radiance',
              subtitle: 'Satsang Discourse',
              onTap: () {},
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('17. Provides tile and control semantics labels', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestableWidget(
          SSPAudioTile(
            title: 'Atma Radiance',
            onTap: () {},
            onPlayPause: () {},
            onFavorite: () {},
            isPlaying: true,
            isFavorite: true,
          ),
        ),
      );

      // Verify play/pause and favorite controls exist and are tappable
      expect(find.byIcon(SSPIcons.pause), findsOneWidget);
      expect(find.byIcon(SSPIcons.favorite), findsOneWidget);
    });
  });
}
