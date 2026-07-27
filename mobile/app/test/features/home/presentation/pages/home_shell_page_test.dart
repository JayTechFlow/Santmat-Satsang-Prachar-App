import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/pages/home_shell_page.dart';
import 'package:santmat_satsang_prachar/l10n/gen/app_localizations.dart';

void main() {
  testWidgets('HomeShellPage renders NavigationBar with 5 tabs', (
    WidgetTester tester,
  ) async {
    // We cannot easily mock StatefulNavigationShell for a widget test without a full GoRouter setup.
    // Instead, we will verify the structure using a minimal router setup.

    final router = GoRouter(
      initialLocation: '/',
      routes: [
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) {
            return HomeShellPage(navigationShell: navigationShell);
          },
          branches: [
            StatefulShellBranch(
              routes: [GoRoute(path: '/', builder: (c, s) => const Scaffold())],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(path: '/satsang', builder: (c, s) => const Scaffold()),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(path: '/audio', builder: (c, s) => const Scaffold()),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(path: '/books', builder: (c, s) => const Scaffold()),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(path: '/settings', builder: (c, s) => const Scaffold()),
              ],
            ),
          ],
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(
        routerConfig: router,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
      ),
    );

    await tester.pumpAndSettle();

    // Verify NavigationBar exists
    expect(find.byType(BottomNavigationBar), findsOneWidget);

    // Verify 5 NavigationDestinations exist
    expect(find.text('होम'), findsOneWidget);
    expect(find.text('ऑडियो'), findsOneWidget);
    expect(find.text('स्तुति-बिन्ती'), findsOneWidget);
    expect(find.text('सूचनाएँ'), findsOneWidget);
    expect(find.text('प्रोफ़ाइल'), findsOneWidget);
  });
}
