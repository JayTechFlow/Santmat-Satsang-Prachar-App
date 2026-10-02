import 'dart:developer' as developer;

import 'package:flutter/foundation.dart';

/// Debug-only navigation instrumentation (PHASE 18).
///
/// Emits a compact, privacy-safe trace of every resolved back decision so the
/// behaviour can be verified from `logcat` / `flutter logs` without attaching a
/// debugger. No user content, identifiers or tokens are ever logged — only
/// route patterns, route kinds and the resolved action.
class NavLog {
  const NavLog._();

  static const String _tag = 'SSP_NAV';

  /// Navigation tracing is only compiled into debug builds.
  static bool get enabled => kDebugMode;

  /// Records a resolved Back decision.
  static void back({
    required String current,
    required String kind,
    required String action,
    required String destination,
    required int stackDepth,
    required bool exitArmed,
  }) {
    if (!enabled) return;
    developer.log(
      'BACK current=$current type=$kind destination=$destination '
      'action=$action depth=$stackDepth exitArmed=$exitArmed',
      name: _tag,
    );
  }

  /// Records a shell branch switch.
  static void branch({required int from, required int to}) {
    if (!enabled) return;
    developer.log('BRANCH from=$from to=$to', name: _tag);
  }

  /// Records a resolved route transition. [reason] is optional context such as
  /// the canonical player source that produced the transition.
  static void route({
    required String from,
    required String to,
    String? reason,
  }) {
    if (!enabled) return;
    developer.log(
      'ROUTE from=$from to=$to${reason == null ? '' : ' reason=$reason'}',
      name: _tag,
    );
  }

  /// Records a rejected navigation (unknown route, guard bounce, ...).
  static void rejected({required String target, required String reason}) {
    if (!enabled) return;
    developer.log('REJECTED target=$target reason=$reason', name: _tag);
  }
}
