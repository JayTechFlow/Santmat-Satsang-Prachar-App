import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'navigation_logger.dart';
import 'root_exit_controller.dart';
import 'root_navigator.dart';
import 'route_hierarchy.dart';
import 'shell_navigation_scope.dart';

/// What a resolved Back press should do.
enum BackAction {
  /// Nested child page — return to the logical parent that is on the stack.
  popToParent,

  /// Top-level user page or non-Home tab — return to Home.
  goToHome,

  /// First Back at root Home — stay put and prompt.
  armExit,

  /// Second Back at root Home within the timeout — close the application.
  exitApp,
}

/// Where the Back press originated. Both sources share the same policy.
enum BackSource {
  /// Android hardware / gesture back.
  system,

  /// AppBar back button.
  appBar,
}

/// The outcome of the canonical back policy for one Back press.
class BackResolution {
  const BackResolution({
    required this.action,
    required this.destination,
    required this.kind,
    required this.location,
    required this.rootDepth,
  });

  final BackAction action;

  /// Human readable destination, e.g. `/audio` or `<logical parent>`.
  final String destination;

  final SspRouteKind kind;
  final String location;
  final int rootDepth;

  @override
  String toString() =>
      'BackResolution($location, ${kind.name} -> ${action.name} => '
      '$destination, depth=$rootDepth)';

  @override
  bool operator ==(Object other) =>
      other is BackResolution &&
      other.action == action &&
      other.destination == destination &&
      other.kind == kind &&
      other.location == location &&
      other.rootDepth == rootDepth;

  @override
  int get hashCode =>
      Object.hash(action, destination, kind, location, rootDepth);
}

/// The one canonical back policy for the whole application (PHASE 3).
///
/// ```
/// IF a page is stacked above the app shell:
///     IF that page is a top-level secondary page  -> go to HOME
///     ELSE                                       -> pop to the logical parent
/// ELSE IF the active shell tab is not HOME        -> switch to the HOME tab
/// ELSE IF the location is root HOME              -> first Back arms the exit,
///                                                   second Back within the
///                                                   timeout exits the app
/// ```
///
/// The policy is expressed by the pure [resolve] function so it can be
/// regression-tested for its destination without pumping widgets, and applied
/// through [handleBack] so the Android system Back and the AppBar back button
/// always agree.
class BackNavigationController {
  const BackNavigationController(this.ref);

  final Ref ref;

  /// Pure policy evaluation.
  BackResolution resolve({
    required String location,
    required int rootDepth,
  }) {
    final info = classifySspRoute(location);

    // --- A page is stacked above the app shell -----------------------------
    if (rootDepth > 1) {
      if (info.isTopLevel) {
        // A top-level secondary page always resolves back to HOME, no matter
        // which tab happened to be active when it was opened.
        return BackResolution(
          action: BackAction.goToHome,
          destination: kSspRootPath,
          kind: info.kind,
          location: location,
          rootDepth: rootDepth,
        );
      }
      // Nested child: pop the real stack, which is origin-aware by
      // construction (Search -> Player returns to Search, Audio -> Player
      // returns to Audio, Favorites -> Player returns to Favorites).
      return BackResolution(
        action: BackAction.popToParent,
        destination: info.parentPattern ?? '<previous page>',
        kind: info.kind,
        location: location,
        rootDepth: rootDepth,
      );
    }

    // --- Shell level (only the app shell is on the stack) ------------------
    // The decision is made from the location itself, so it stays correct even
    // when the shell scope is not reachable from the caller's context.
    if (info.isShellTab && info.location != kSspRootPath) {
      return BackResolution(
        action: BackAction.goToHome,
        destination: kSspRootPath,
        kind: info.kind,
        location: location,
        rootDepth: rootDepth,
      );
    }

    if (info.isAuth) {
      // Nothing to pop and never a surprise exit: behave like root.
      return BackResolution(
        action: BackAction.armExit,
        destination: kSspRootPath,
        kind: info.kind,
        location: location,
        rootDepth: rootDepth,
      );
    }

    // Root HOME.
    return BackResolution(
      action: BackAction.armExit,
      destination: '<exit app>',
      kind: info.kind,
      location: location,
      rootDepth: rootDepth,
    );
  }

  /// Applies the policy for a Back press coming from [context].
  Future<BackResolution> handleBack(
    BuildContext context, {
    BackSource source = BackSource.system,
  }) async {
    final router = GoRouter.of(context);
    final location = router.state.uri.path;
    final depth = rootStackDepth();
    final shellScope =
        context.findAncestorWidgetOfExactType<ShellNavigationScope>();

    final resolution = resolve(location: location, rootDepth: depth);

    final exit = ref.read(rootExitControllerProvider.notifier);
    final exitState = ref.read(rootExitControllerProvider);

    NavLog.back(
      current: resolution.location,
      kind: resolution.kind.name,
      destination: resolution.destination,
      action: switch (resolution.action) {
        BackAction.popToParent => 'pop',
        BackAction.goToHome => 'goHome',
        BackAction.armExit => exitState.armed ? 'exit' : 'armExit',
        BackAction.exitApp => 'exit',
      },
      stackDepth: depth,
      exitArmed: exitState.armed,
    );

    switch (resolution.action) {
      case BackAction.popToParent:
        exit.disarm();
        if (context.canPop()) {
          context.pop();
        } else {
          _goHome(context, shellScope);
        }

      case BackAction.goToHome:
        exit.disarm();
        _goHome(context, shellScope);

      case BackAction.armExit:
      case BackAction.exitApp:
        final action = exit.onBack();
        if (action == RootExitAction.exit) {
          _requestExit();
        } else {
          _showExitPrompt(context, shellScope);
        }
    }

    if (source == BackSource.appBar && resolution.action != BackAction.armExit) {
      NavLog.route(
        from: resolution.location,
        to: resolution.destination,
      );
    }

    return resolution;
  }

  /// Returns the user to Home without ever stacking a second Home.
  void _goHome(BuildContext context, ShellNavigationScope? shellScope) {
    // A page may be stacked above the shell, for example a top-level secondary
    // page opened while another tab was active. `go` replaces the whole route
    // match list, so that page is removed *and* the Home branch is selected in
    // one deterministic step. Popping first and then switching the branch
    // leaves the stacked page on screen, and re-reading the stack depth after a
    // pop is unreliable because the navigator updates lazily.
    if (rootStackDepth() > 1) {
      context.go(kSspRootPath);
      return;
    }

    final shell = shellScope?.navigationShell;
    if (shell != null) {
      NavLog.branch(from: shell.currentIndex, to: kSspHomeBranch);
      // `initialLocation: true` resets the Home branch to its root so repeated
      // taps cannot accumulate a Home stack (PHASE 17).
      shell.goBranch(kSspHomeBranch, initialLocation: true);
      return;
    }

    // No shell in scope. `go` replaces the stack rather than pushing, so no
    // duplicate Home instance is ever created.
    context.go(kSspRootPath);
  }

  void _showExitPrompt(
    BuildContext context,
    ShellNavigationScope? shell,
  ) {
    final messengerContext = shell?.promptContext ?? context;
    final messenger = ScaffoldMessenger.maybeOf(messengerContext);
    if (messenger == null) return;
    messenger
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Text(
            RootExitController.kExitPrompt,
            style: const TextStyle(fontFamily: 'Mukta'),
            textAlign: TextAlign.center,
          ),
          behavior: SnackBarBehavior.floating,
          duration: RootExitController.kExitArmTimeout,
          backgroundColor: const Color(0xFF292524),
        ),
      );
  }

  void _requestExit() {
    NavLog.rejected(target: kSspRootPath, reason: 'root-double-back-confirmed');
    SystemNavigator.pop();
  }
}

final backNavigationControllerProvider =
    Provider<BackNavigationController>(BackNavigationController.new);
