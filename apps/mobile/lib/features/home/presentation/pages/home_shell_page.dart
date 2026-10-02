import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/canonical_back_handler.dart';
import '../../../../core/navigation/root_exit_controller.dart';
import '../../../../core/navigation/route_hierarchy.dart';
import '../../../../core/navigation/shell_navigation_scope.dart';
import '../../../../shared/widgets/bottom_nav_bar.dart';
import '../../../audio/presentation/widgets/mini_player.dart';

/// Reconstructed HomeShellPage hosting the global app shell,
/// floating mini player, and bottom navigation bar.
///
/// This widget is also the app's single back-navigation interception point:
/// [CanonicalBackHandler] is installed here so the Android system Back button
/// is routed through the canonical back policy instead of bubbling out of the
/// navigator and terminating the application.
///
/// It also owns the one place that knows *when* the exit prompt must be
/// dropped: the prompt belongs to the root Home route alone, so navigating to
/// any other route clears it immediately rather than letting a stale "armed"
/// flag survive on a screen the user never prompted on.
class HomeShellPage extends ConsumerStatefulWidget {
  final StatefulNavigationShell navigationShell;

  const HomeShellPage({super.key, required this.navigationShell});

  @override
  ConsumerState<HomeShellPage> createState() => _HomeShellPageState();
}

class _HomeShellPageState extends ConsumerState<HomeShellPage> {
  GoRouter? _router;
  RouterDelegate<Object?>? _delegate;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final router = GoRouter.of(context);
    if (identical(router, _router)) return;
    // `GoRouter` is not a Listenable; its delegate is, and it notifies on
    // every location change.
    _delegate?.removeListener(_onRouteChanged);
    _router = router;
    _delegate = router.routerDelegate..addListener(_onRouteChanged);
  }

  void _onRouteChanged() {
    if (!mounted) return;
    final location = _router?.state.uri.path ?? kSspRootPath;
    if (location == kSspRootPath) return;
    // Leaving the root Home must not carry the exit prompt along, otherwise a
    // stale armed state could make the next Back exit without ever prompting.
    ref.read(rootExitControllerProvider.notifier).disarm();
    // The prompt itself belongs to the root route, so retire it too instead of
    // leaving it floating over an unrelated screen for the rest of its duration.
    ScaffoldMessenger.maybeOf(context)?.clearSnackBars();
  }

  @override
  void dispose() {
    _delegate?.removeListener(_onRouteChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final navigationShell = widget.navigationShell;

    return ShellNavigationScope(
      navigationShell: navigationShell,
      promptContext: context,
      // The interceptor must sit *inside* the scope so that the canonical
      // policy can see which branch is active when it resolves a Back press.
      child: CanonicalBackHandler(
        child: Builder(
          builder: (shellContext) {
            final scope = shellContext
                .findAncestorWidgetOfExactType<ShellNavigationScope>()!;
            return Scaffold(
              body: navigationShell,
              bottomNavigationBar: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const MiniPlayer(),
                  BottomNavBar(
                    currentIndex: navigationShell.currentIndex,
                    // `ShellNavigationScope.goBranch` gives deterministic tab
                    // semantics: tapping the active tab resets it to its root
                    // instead of stacking (PHASE 9 / PHASE 17).
                    onTap: scope.goBranch,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
