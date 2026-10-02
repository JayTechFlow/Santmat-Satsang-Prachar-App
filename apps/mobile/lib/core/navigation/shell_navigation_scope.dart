import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Exposes the app shell's `StatefulNavigationShell` plus a context that is
/// guaranteed to sit under the shell's `ScaffoldMessenger`.
///
/// Every back decision that happens at shell level (bottom-navigation tabs and
/// the root Home double-back prompt) reads this scope, which is what makes
/// "Back from a tab returns to Home" and "Back at Home shows the prompt"
/// deterministic instead of dependent on which tab was last visited.
class ShellNavigationScope extends InheritedWidget {
  const ShellNavigationScope({
    super.key,
    required this.navigationShell,
    required this.promptContext,
    required super.child,
  });

  final StatefulNavigationShell navigationShell;

  /// Context below the shell's `Scaffold`, used to raise the exit prompt.
  final BuildContext promptContext;

  /// The currently selected bottom-navigation branch index.
  int get currentIndex => navigationShell.currentIndex;

  /// Switches to a branch. Tapping the already-active branch resets it to its
  /// root location, which prevents unbounded stack growth (PHASE 17).
  void goBranch(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  /// Returns to the Home branch.
  void goHome() => goBranch(0);

  @override
  bool updateShouldNotify(ShellNavigationScope oldWidget) =>
      oldWidget.navigationShell != navigationShell ||
      oldWidget.currentIndex != currentIndex;
}
