import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_analytics_service.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_session_reporter.dart';
import 'package:santmat_satsang_prachar/core/services/firebase_analytics_service.dart';

/// Captures the sessions the service reports to the analytics backend.
class _RecordingReporter extends PlaybackSessionReporter {
  final List<Map<String, Object?>> reported = [];
  final List<String> generatedIds = [];
  int heartbeatPings = 0;

  @override
  String generateSessionId() {
    final id = 'testid${generatedIds.length.toString().padLeft(3, '0')}';
    generatedIds.add(id);
    return id;
  }

  @override
  Future<bool> reportSession({
    required String sessionId,
    required String contentId,
    required String contentType,
    String? category,
    required int listenedSeconds,
    required int startedAtMs,
    int? mediaDurationSeconds,
    int? endPositionSeconds,
    bool completed = false,
  }) async {
    // Recorded synchronously so assertions are deterministic even though the
    // service fires some flushes without awaiting them.
    reported.add(<String, Object?>{
      'sessionId': sessionId,
      'contentId': contentId,
      'contentType': contentType,
      'category': category,
      'listenedSeconds': listenedSeconds,
      'startedAtMs': startedAtMs,
      'mediaDurationSeconds': mediaDurationSeconds,
      'endPositionSeconds': endPositionSeconds,
      'completed': completed,
    });
    return true;
  }

  @override
  Future<bool> touchActiveUser() async {
    heartbeatPings++;
    return true;
  }
}

/// Captures GA4 events without touching the Firebase SDK.
class _RecordingAnalytics extends FirebaseAnalyticsService {
  final List<String> events = [];

  @override
  Future<void> logEvent(String name, {Map<String, Object>? parameters}) async {
    events.add(name);
  }
}

/// Verifies the playback session accounting the Admin Reports page depends on.
///
/// `totalPlays` counts reported sessions and `totalListenDurationSeconds` sums
/// their listened seconds, so both must be correct here. Two defects were found
/// by these tests: flushing on pause, and flushing on seek, each minted an extra
/// session id and therefore inflated the play count.
void main() {
  late _RecordingReporter reporter;
  late _RecordingAnalytics ga4;
  late DateTime clock;

  PlaybackAnalyticsService build() => PlaybackAnalyticsService(
    ga4,
    sessionReporter: reporter,
    clock: () => clock,
  );

  /// Total listening seconds across every reported session.
  int totalListened() => reporter.reported.fold<int>(
    0,
    (sum, e) => sum + (e['listenedSeconds']! as int),
  );

  setUp(() {
    reporter = _RecordingReporter();
    ga4 = _RecordingAnalytics();
    clock = DateTime.utc(2026, 10, 1, 12);
  });

  test('reports nothing before playback starts', () {
    build();
    expect(reporter.reported, isEmpty);
    expect(reporter.generatedIds, isEmpty);
  });

  test('reports one play with the accumulated listening time', () async {
    final service = build();
    await service.logMediaPlay(id: 'bhajan_1', title: 'Guru', category: 'भजन');
    clock = clock.add(const Duration(seconds: 30));
    await service.logMediaComplete(id: 'bhajan_1', duration: const Duration(seconds: 30));

    expect(reporter.reported, hasLength(1));
    final session = reporter.reported.single;
    expect(session['contentId'], 'bhajan_1');
    expect(session['listenedSeconds'], 30);
    expect(session['category'], 'भजन');
    expect(session['completed'], isTrue);
  });

  test('pause/resume stays a single play and excludes paused time', () async {
    final service = build();

    await service.logMediaPlay(id: 'bhajan_1', title: 'Guru');
    clock = clock.add(const Duration(seconds: 20));
    await service.logMediaPause(id: 'bhajan_1', position: const Duration(seconds: 20));

    // Long pause — must not accrue listening time.
    clock = clock.add(const Duration(minutes: 10));

    await service.logMediaPlay(id: 'bhajan_1', title: 'Guru');
    clock = clock.add(const Duration(seconds: 5));
    await service.logMediaComplete(id: 'bhajan_1', duration: const Duration(seconds: 25));

    expect(reporter.reported, hasLength(1), reason: 'pause/resume must not create a second play');
    expect(totalListened(), 25, reason: 'paused time must not count as listening');
  });

  test('several pause/resume cycles still produce exactly one play', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');

    for (var i = 0; i < 4; i++) {
      clock = clock.add(const Duration(seconds: 10));
      await service.logMediaPause(id: 'b1', position: Duration(seconds: 10 * (i + 1)));
      clock = clock.add(const Duration(minutes: 5));
      await service.logMediaPlay(id: 'b1', title: 'A');
    }

    clock = clock.add(const Duration(seconds: 3));
    await service.logMediaComplete(id: 'b1', duration: const Duration(seconds: 43));

    expect(reporter.reported, hasLength(1));
    expect(totalListened(), 43);
  });

  test('seeking keeps one play and sums the listening either side', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');

    clock = clock.add(const Duration(seconds: 12));
    await service.logMediaSeek(id: 'b1', targetPosition: const Duration(seconds: 300));

    clock = clock.add(const Duration(seconds: 9));
    await service.logMediaComplete(id: 'b1', duration: const Duration(seconds: 309));

    expect(reporter.reported, hasLength(1), reason: 'a seek must not create a second play');
    expect(totalListened(), 21);
  });

  test('switching tracks reports the previous session then starts a new one', () async {
    final service = build();

    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 15));
    await service.logMediaPlay(id: 'b2', title: 'B');
    clock = clock.add(const Duration(seconds: 8));
    await service.logMediaComplete(id: 'b2', duration: const Duration(seconds: 8));

    expect(reporter.reported, hasLength(2));
    expect(reporter.reported[0]['contentId'], 'b1');
    expect(reporter.reported[0]['listenedSeconds'], 15);
    expect(reporter.reported[1]['contentId'], 'b2');
    expect(reporter.reported[1]['listenedSeconds'], 8);
  });

  test('each track gets a distinct session id for server-side idempotency', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 5));
    await service.logMediaPlay(id: 'b2', title: 'B');
    clock = clock.add(const Duration(seconds: 5));
    await service.logMediaComplete(id: 'b2', duration: const Duration(seconds: 5));

    final ids = reporter.reported.map((e) => e['sessionId']).toSet();
    expect(ids, hasLength(2));
  });

  test('pausing alone does not report a session yet', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 5));
    await service.logMediaPause(id: 'b1', position: const Duration(seconds: 5));

    expect(
      reporter.reported,
      isEmpty,
      reason: 'an open session must stay open so its id is reused on resume',
    );
  });

  test('a flush with no open session reports nothing', () async {
    final service = build();
    service.unawaitedFlush();
    expect(reporter.reported, isEmpty);
  });

  test('never reports a negative listened duration', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    // Pause in the same instant: zero elapsed, never negative.
    await service.logMediaPause(id: 'b1', position: Duration.zero);
    await service.logMediaComplete(id: 'b1', duration: Duration.zero);

    expect(totalListened(), 0);
    for (final session in reporter.reported) {
      expect(session['listenedSeconds'], greaterThanOrEqualTo(0));
    }
  });

  test('ignores an absurd clock jump instead of inflating playtime', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    // Device clock jumps forward a week.
    clock = clock.add(const Duration(days: 7));
    await service.logMediaComplete(id: 'b1', duration: const Duration(days: 7));

    expect(totalListened(), 0, reason: 'a clock jump must not become listening time');
  });

  test('passes media duration through so completion can be judged server-side', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A', durationSeconds: 305);
    clock = clock.add(const Duration(seconds: 305));
    await service.logMediaComplete(id: 'b1', duration: const Duration(seconds: 305));

    expect(reporter.reported.single['mediaDurationSeconds'], 305);
  });

  test('records the media type for non-audio content', () async {
    final service = build();
    await service.logMediaPlay(id: 'stuti_1', title: 'Prarthana', mediaType: 'video');
    clock = clock.add(const Duration(seconds: 4));
    await service.logMediaComplete(id: 'stuti_1', duration: const Duration(seconds: 4));

    expect(reporter.reported.single['contentType'], 'video');
  });

  test('refreshes the activity heartbeat when a session starts', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    expect(reporter.heartbeatPings, greaterThan(0));
  });

  test('logMediaStop flushes and finalizes active session', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'Track 1');
    clock = clock.add(const Duration(seconds: 45));
    await service.logMediaStop(id: 'b1');

    expect(reporter.reported, hasLength(1));
    final session = reporter.reported.single;
    expect(session['contentId'], 'b1');
    expect(session['listenedSeconds'], 45);
    expect(session['completed'], isFalse);

    // Starting a new track after stop creates a fresh distinct session
    await service.logMediaPlay(id: 'b1', title: 'Track 1');
    clock = clock.add(const Duration(seconds: 20));
    await service.logMediaStop(id: 'b1');

    expect(reporter.reported, hasLength(2));
    expect(reporter.reported[0]['sessionId'], isNot(equals(reporter.reported[1]['sessionId'])));
  });

  test('player rebuild and repeated play calls on same track do not duplicate play', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 15));

    // Simulated widget rebuild / re-invoked play on same track
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 15));
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 10));

    await service.logMediaComplete(id: 'b1', duration: const Duration(seconds: 40));

    expect(reporter.reported, hasLength(1), reason: 're-invoking play on the same track must not duplicate session');
    expect(totalListened(), 40);
  });

  test('retry and reconnect continue same session without inflating play count', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 25));

    // Network hiccup / error
    await service.logMediaError(id: 'b1', error: 'connection reset');

    // Retry on same track resumes session
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 35));
    await service.logMediaComplete(id: 'b1', duration: const Duration(seconds: 60));

    expect(reporter.reported, hasLength(1));
    expect(totalListened(), 60);
  });

  test('reported payload satisfies the backend contract schema', () async {
    final service = build();
    await service.logMediaPlay(
      id: 'bhajan_valid_123',
      title: 'Valid Track',
      category: 'सत्संग',
      durationSeconds: 180,
    );
    clock = clock.add(const Duration(seconds: 50));
    await service.logMediaComplete(id: 'bhajan_valid_123', duration: const Duration(seconds: 180));

    final payload = reporter.reported.single;
    final sessionId = payload['sessionId'] as String;
    final contentId = payload['contentId'] as String;
    final contentType = payload['contentType'] as String;
    final listened = payload['listenedSeconds'] as int;

    // Matches backend SESSION_ID_PATTERN: ^[A-Za-z0-9_-]{8,64}$
    expect(RegExp(r'^[A-Za-z0-9_-]{8,64}$').hasMatch(sessionId), isTrue);
    // Matches backend CONTENT_ID_PATTERN: ^[A-Za-z0-9_-]{1,128}$
    expect(RegExp(r'^[A-Za-z0-9_-]{1,128}$').hasMatch(contentId), isTrue);
    // Matches backend PLAYBACK_CONTENT_TYPES: ['audio', 'video', 'book']
    expect(['audio', 'video', 'book'], contains(contentType));
    expect(listened, greaterThanOrEqualTo(0));
  });

  test('still mirrors playback events to Google Analytics', () async {
    final service = build();
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 5));
    await service.logMediaPause(id: 'b1', position: const Duration(seconds: 5));
    await service.logMediaPlay(id: 'b1', title: 'A');
    clock = clock.add(const Duration(seconds: 5));
    await service.logMediaSeek(id: 'b1', targetPosition: const Duration(seconds: 10));
    await service.logMediaComplete(id: 'b1', duration: const Duration(seconds: 10));
    await service.logMediaDownload(id: 'b1', title: 'A');
    await service.logMediaError(id: 'b1', error: 'decoder failure');
    await service.logMediaStop(id: 'b1');

    expect(
      ga4.events,
      containsAll(<String>[
        'media_play',
        'media_pause',
        'media_seek',
        'media_complete',
        'media_download',
        'media_error',
        'media_stop',
      ]),
    );
  });
}