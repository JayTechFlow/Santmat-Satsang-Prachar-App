import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'route_hierarchy.dart';

/// Immutable snapshot of the root double-back-to-exit state.
@immutable
class RootExitState {
  const RootExitState({
    this.armed = false,
    this.promptCount = 0,
    this.exitCount = 0,
  });

  /// True while the first Back has been registered and the exit timer runs.
  final bool armed;

  /// How many times the "press back again to exit" prompt has been shown.
  final int promptCount;

  /// How many times the application has actually been asked to exit.
  final int exitCount;

  static const RootExitState initial = RootExitState();

  @override
  bool operator ==(Object other) =>
      other is RootExitState &&
      other.armed == armed &&
      other.promptCount == promptCount &&
      other.exitCount == exitCount;

  @override
  int get hashCode => Object.hash(armed, promptCount, exitCount);

  @override
  String toString() =>
      'RootExitState(armed: $armed, prompts: $promptCount, exits: $exitCount)';
}

/// What the caller must do after a Back press at the root Home location.
enum RootExitAction {
  /// Stay on Home and tell the user that a second Back will exit.
  arm,

  /// The user confirmed; close the application.
  exit,
}

/// Owns the **only** double-back-to-exit state in the application (PHASE 4).
///
/// Contract:
///  * The state exists solely for the root Home location.
///  * It is armed by the first Back and disarmed automatically when the
///    [kExitArmTimeout] elapses, or as soon as navigation moves away from the
///    root location. It therefore never leaks into an unrelated route.
///  * It never calls `exit(0)`; it returns [RootExitAction.exit] and the
///    single navigation controller performs the platform exit.
class RootExitController extends Notifier<RootExitState> {
  /// Short, user-friendly window for the second Back press.
  static const Duration kExitArmTimeout = Duration(seconds: 2);

  /// Message shown after the first Back at Home.
  static const String kExitPrompt =
      'दोबारा Back दबाएँ बाहर निकलने के लिए';

  Timer? _timer;
  VoidCallback? _onPrompt;

  @override
  RootExitState build() {
    ref.onDispose(_cancelTimer);
    return RootExitState.initial;
  }

  /// Registers a callback invoked whenever the exit prompt should be shown.
  void setPromptListener(VoidCallback? listener) {
    _onPrompt = listener;
  }

  /// Handles a Back press at the root Home location.
  RootExitAction onBack() {
    if (state.armed) {
      _cancelTimer();
      state = RootExitState(
        promptCount: state.promptCount,
        exitCount: state.exitCount + 1,
      );
      return RootExitAction.exit;
    }

    _arm();
    return RootExitAction.arm;
  }

  void _arm() {
    _cancelTimer();
    state = RootExitState(
      armed: true,
      promptCount: state.promptCount + 1,
      exitCount: state.exitCount,
    );
    _timer = Timer(kExitArmTimeout, () {
      // Timeout expired: the next Back behaves like a first Back again.
      if (!state.armed) return;
      state = RootExitState(
        promptCount: state.promptCount,
        exitCount: state.exitCount,
      );
    });
  }

  /// Clears the armed state. Called whenever navigation leaves the root.
  void disarm() {
    if (!state.armed && _timer == null) return;
    _cancelTimer();
    state = RootExitState(
      promptCount: state.promptCount,
      exitCount: state.exitCount,
    );
  }

  /// Clears every trace of the flow, including counters. Used by tests.
  void reset() {
    _cancelTimer();
    state = RootExitState.initial;
  }

  void _cancelTimer() {
    _timer?.cancel();
    _timer = null;
  }

  /// Invokes the registered prompt listener if this transition armed the flow.
  void notifyPrompt() {
    if (_onPrompt != null) _onPrompt!();
  }
}

final rootExitControllerProvider =
    NotifierProvider<RootExitController, RootExitState>(RootExitController.new);

/// Convenience used by the policy: whether [path] is the root Home location.
bool isRootHomePath(String? path) =>
    classifySspRoute(path).kind == SspRouteKind.root;
