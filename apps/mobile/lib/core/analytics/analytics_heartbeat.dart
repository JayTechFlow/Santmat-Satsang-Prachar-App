import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../media/presentation/providers/media_providers.dart';
import 'playback_session_reporter.dart';

/// Emits the activity heartbeat that the Admin "Active Users" metric depends on.
///
/// Without a heartbeat there is no evidence that a user was present in the app,
/// so active users can only be inferred from finished playback sessions — which
/// misses browsing, reading and search entirely. This widget therefore reports on:
///
///  - app resume (`AppLifecycleState.resumed`), and
///  - a periodic tick while the app is in the foreground.
///
/// The server throttles writes (5 minutes), so these calls are cheap and are
/// expected to no-op server-side for the common case.
class AnalyticsHeartbeat extends ConsumerStatefulWidget {
  const AnalyticsHeartbeat({super.key, required this.child, this.interval = const Duration(minutes: 5)});

  final Widget child;
  final Duration interval;

  @override
  ConsumerState<AnalyticsHeartbeat> createState() => _AnalyticsHeartbeatState();
}

class _AnalyticsHeartbeatState extends ConsumerState<AnalyticsHeartbeat>
    with WidgetsBindingObserver {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _start();
  }

  void _start() {
    _timer?.cancel();
    _timer = Timer.periodic(widget.interval, (_) => _ping());
  }

  void _ping() {
    // Read the reporter through the same provider graph as playback analytics so
    // tests can substitute a fake without touching this widget.
    // ignore: discarded_futures
    ref.read(analyticsHeartbeatProvider).ping();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _ping();
      _start();
    } else if (state == AppLifecycleState.detached) {
      ref.read(playbackAnalyticsServiceProvider).unawaitedFlush();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _timer = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

/// Injectable heartbeat reporter, so the widget stays testable and so the
/// reporter instance is shared with the playback analytics path.
final analyticsHeartbeatProvider = Provider<PlaybackSessionReporter>(
  (ref) => ref.watch(playbackSessionReporterProvider),
);