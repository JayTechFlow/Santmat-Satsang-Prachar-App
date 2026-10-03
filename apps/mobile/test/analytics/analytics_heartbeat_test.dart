import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/analytics/analytics_heartbeat.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_analytics_service.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_session_reporter.dart';
import 'package:santmat_satsang_prachar/core/media/presentation/providers/media_providers.dart';
import 'package:santmat_satsang_prachar/core/services/firebase_analytics_service.dart';

class _FakeReporter extends PlaybackSessionReporter {
  int pings = 0;

  @override
  Future<bool> touchActiveUser() async {
    pings++;
    return true;
  }
}

class _FakeAnalyticsService extends PlaybackAnalyticsService {
  _FakeAnalyticsService() : super(_NoOpAnalyticsService());

  int flushCount = 0;

  @override
  void unawaitedFlush({bool completed = false, int? endPositionSeconds}) {
    flushCount++;
  }
}

class _NoOpAnalyticsService extends Fake implements FirebaseAnalyticsService {}

void main() {
  testWidgets('AnalyticsHeartbeat pings on interval and cleans up on dispose', (tester) async {
    final fakeReporter = _FakeReporter();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          playbackSessionReporterProvider.overrideWithValue(fakeReporter),
        ],
        child: const MaterialApp(
          home: AnalyticsHeartbeat(
            interval: Duration(seconds: 1),
            child: Text('Child'),
          ),
        ),
      ),
    );

    expect(find.text('Child'), findsOneWidget);
    expect(fakeReporter.pings, 0);

    // Advance 1 second: timer fires
    await tester.pump(const Duration(seconds: 1));
    expect(fakeReporter.pings, 1);

    // Advance another second: timer fires again
    await tester.pump(const Duration(seconds: 1));
    expect(fakeReporter.pings, 2);

    // Dispose widget
    await tester.pumpWidget(const SizedBox());

    // Advance time: timer was cancelled, pings should not increment
    await tester.pump(const Duration(seconds: 5));
    expect(fakeReporter.pings, 2);
  });

  testWidgets('AnalyticsHeartbeat handles app lifecycle changes', (tester) async {
    final fakeReporter = _FakeReporter();
    final fakeAnalytics = _FakeAnalyticsService();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          playbackSessionReporterProvider.overrideWithValue(fakeReporter),
          playbackAnalyticsServiceProvider.overrideWithValue(fakeAnalytics),
        ],
        child: const MaterialApp(
          home: AnalyticsHeartbeat(
            interval: Duration(minutes: 5),
            child: Text('App Root'),
          ),
        ),
      ),
    );

    // Simulate app resume
    tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
    await tester.pump();
    expect(fakeReporter.pings, 1);

    // Simulate app detached (teardown): triggers flush
    tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.detached);
    await tester.pump();
    expect(fakeAnalytics.flushCount, 1);
  });
}
