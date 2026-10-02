import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/pages/home_shell_page.dart';
import 'package:santmat_satsang_prachar/l10n/gen/app_localizations.dart';
import 'package:santmat_satsang_prachar/shared/widgets/bottom_nav_bar.dart';

void main() {
  testWidgets('HomeShellPage renders BottomNavBar and tapping tabs navigates correctly', (
    WidgetTester tester,
  ) async {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) {
            return HomeShellPage(navigationShell: navigationShell);
          },
          branches: [
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/',
                  builder: (c, s) => const Scaffold(body: Center(child: Text('Home Destination'))),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/audio',
                  builder: (c, s) => const Scaffold(body: Center(child: Text('Audio Destination'))),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/satsang',
                  builder: (c, s) => const Scaffold(body: Center(child: Text('Satsang Destination'))),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/notifications',
                  builder: (c, s) => const Scaffold(body: Center(child: Text('Notifications Destination'))),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/settings',
                  builder: (c, s) => const Scaffold(body: Center(child: Text('Profile Destination'))),
                ),
              ],
            ),
          ],
        ),
      ],
    );

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp.router(
          routerConfig: router,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Verify initial destination is Home
    expect(find.text('Home Destination'), findsOneWidget);
    expect(find.byType(BottomNavBar), findsOneWidget);

    // Verify all 5 tab buttons exist
    expect(find.text('होम'), findsOneWidget);
    expect(find.text('ऑडियो'), findsOneWidget);
    expect(find.text('स्तुति-बिनती'), findsOneWidget);
    expect(find.text('सूचनाएँ'), findsOneWidget);
    expect(find.text('प्रोफ़ाइल'), findsOneWidget);

    // 1. Tap Audio tab
    await tester.tap(find.text('ऑडियो'));
    await tester.pumpAndSettle();
    expect(find.text('Audio Destination'), findsOneWidget);

    // 2. Return Home
    await tester.tap(find.text('होम'));
    await tester.pumpAndSettle();
    expect(find.text('Home Destination'), findsOneWidget);

    // 3. Tap Stuti-Vinati tab
    await tester.tap(find.text('स्तुति-बिनती'));
    await tester.pumpAndSettle();
    expect(find.text('Satsang Destination'), findsOneWidget);

    // 4. Return Home
    await tester.tap(find.text('होम'));
    await tester.pumpAndSettle();
    expect(find.text('Home Destination'), findsOneWidget);

    // 5. Tap Notifications tab
    await tester.tap(find.text('सूचनाएँ'));
    await tester.pumpAndSettle();
    expect(find.text('Notifications Destination'), findsOneWidget);

    // 6. Return Home
    await tester.tap(find.text('होम'));
    await tester.pumpAndSettle();
    expect(find.text('Home Destination'), findsOneWidget);

    // 7. Tap Profile tab
    await tester.tap(find.text('प्रोफ़ाइल'));
    await tester.pumpAndSettle();
    expect(find.text('Profile Destination'), findsOneWidget);

    // 8. Return Home
    await tester.tap(find.text('होम'));
    await tester.pumpAndSettle();
    expect(find.text('Home Destination'), findsOneWidget);
  });
}
