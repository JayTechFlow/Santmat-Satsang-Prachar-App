import 'dart:async';

import 'package:santmat_satsang_prachar/core/services/firebase_analytics_service.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_session_reporter.dart';

/// Emits playback analytics to two independent sinks:
///
///  1. Google Analytics 4 (`FirebaseAnalyticsService`) — product/funnel work.
///  2. A Firestore-backed Cloud Function (`PlaybackSessionReporter`) — the only
///     sink the Admin panel can actually read.
///
/// Sink 2 is what makes the Admin Reports metrics truthful. Sink 1 alone left
/// every Reports metric permanently zero because GA4 is not queryable from
/// Firestore.
class PlaybackAnalyticsService {
  final FirebaseAnalyticsService _analyticsService;
  final PlaybackSessionReporter _sessionReporter;
  final DateTime Function() _now;

  /// Session currently being accumulated, or null when nothing is playing.
  String? _sessionId;
  String? _sessionContentId;
  String? _sessionCategory;
  String _sessionContentType = 'audio';
  int _sessionStartedAtMs = 0;
  int _sessionListenedMs = 0;
  int? _sessionMediaDurationSeconds;
  DateTime? _playingSince;

  PlaybackAnalyticsService(
    this._analyticsService, {
    PlaybackSessionReporter? sessionReporter,
    DateTime Function()? clock,
  }) : _sessionReporter = sessionReporter ?? PlaybackSessionReporter(),
       _now = clock ?? DateTime.now;

  /// Begin (or continue) a playback session.
  ///
  /// Calling this while a session is already open for the same content resumes
  /// that session rather than starting a new one, so a pause/resume cycle is
  /// reported as one continuous play with the total listening time.
  void _beginOrResumeSession({
    required String id,
    required String mediaType,
    String? category,
    int? durationSeconds,
  }) {
    if (_sessionId != null && _sessionContentId == id) {
      // Same track: continue the existing session, restarting the clock if it
      // was paused, so pause/resume/seek stay a single play.
      _resumeSession();
      _sessionMediaDurationSeconds ??= durationSeconds;
      return;
    }

    // A different track (or a fresh start): flush whatever was accumulated
    // before opening the new session so time is never lost.
    if (_sessionId != null) {
      unawaitedFlush();
    }

    _sessionId = _sessionReporter.generateSessionId();
    _sessionContentId = id;
    _sessionCategory = category;
    _sessionContentType = mediaType;
    _sessionStartedAtMs = _now().millisecondsSinceEpoch;
    _sessionListenedMs = 0;
    _sessionMediaDurationSeconds = durationSeconds;
    _playingSince = _now();

    // Heartbeat on session start so active-user tracking is not gated on a
    // session having already finished.
    unawaited(_sessionReporter.touchActiveUser());
  }

  /// Accumulate wall-clock listening time since the last resume/seek point.
  void _accumulateListening() {
    final since = _playingSince;
    if (since == null) return;
    final now = _now();
    final delta = now.difference(since).inMilliseconds;
    // Guard against a device clock jump producing an absurd session length.
    if (delta > 0 && delta < const Duration(hours: 6).inMilliseconds) {
      _sessionListenedMs += delta;
    }
    _playingSince = null;
  }

  /// Stop the accumulation clock but keep the session open.
  ///
  /// Pausing must NOT flush: the session id is the server's idempotency key
  /// and the unit of counting for `totalPlays`. Flushing on pause would end the
  /// session, and the next [logMediaPlay] would mint a fresh id — so every
  /// pause/resume would be reported as an additional play.
  void _pauseSession() {
    _accumulateListening();
  }

  /// Restart the accumulation clock for the still-open session.
  void _resumeSession() {
    if (_sessionId == null) return;
    _playingSince ??= _now();
  }

  /// Mark the session finished and report it.
  Future<void> _flushSession({bool completed = false, int? endPositionSeconds}) async {
    _accumulateListening();

    final sessionId = _sessionId;
    final contentId = _sessionContentId;
    if (sessionId == null || contentId == null) return;

    // Capture before resetting — reading these after the reset would report
    // zero listened seconds for every session.
    final listenedMs = _sessionListenedMs;
    final startedAtMs = _sessionStartedAtMs;
    final contentType = _sessionContentType;
    final category = _sessionCategory;
    final mediaDurationSeconds = _sessionMediaDurationSeconds;

    _sessionId = null;
    _sessionContentId = null;
    _sessionCategory = null;
    _sessionListenedMs = 0;
    _sessionStartedAtMs = 0;
    _sessionMediaDurationSeconds = null;
    _playingSince = null;

    await _sessionReporter.reportSession(
      sessionId: sessionId,
      contentId: contentId,
      contentType: contentType,
      category: category,
      listenedSeconds: listenedMs ~/ 1000,
      startedAtMs: startedAtMs,
      mediaDurationSeconds: mediaDurationSeconds,
      endPositionSeconds: endPositionSeconds,
      completed: completed,
    );
  }

  /// Fire-and-forget flush used from synchronous UI callbacks.
  void unawaitedFlush({bool completed = false, int? endPositionSeconds}) {
    // ignore: discarded_futures
    _flushSession(completed: completed, endPositionSeconds: endPositionSeconds);
  }

  Future<void> logMediaPlay({
    required String id,
    required String title,
    String? mediaType,
    String? category,
    int? durationSeconds,
  }) async {
    _beginOrResumeSession(
      id: id,
      mediaType: mediaType ?? 'audio',
      category: category,
      durationSeconds: durationSeconds,
    );
    await _analyticsService.logEvent(
      'media_play',
      parameters: {
        'media_id': id,
        'media_title': title,
        if (mediaType != null) 'media_type': mediaType,
        if (category != null) 'category': category,
      },
    );
  }

  Future<void> logMediaPause({
    required String id,
    required Duration position,
  }) async {
    // Stop the clock but keep the session open, so the eventual report is one
    // play with the accumulated listening time.
    _pauseSession();
    await _analyticsService.logEvent(
      'media_pause',
      parameters: {
        'media_id': id,
        'position_seconds': position.inSeconds,
      },
    );
  }

  Future<void> logMediaSeek({
    required String id,
    required Duration targetPosition,
  }) async {
    // A seek ends the current contiguous listening run but must keep the same
    // session, so the total listening time is accumulated into one play rather
    // than the seek being counted as an extra play.
    _pauseSession();
    _resumeSession();
    await _analyticsService.logEvent(
      'media_seek',
      parameters: {
        'media_id': id,
        'target_position_seconds': targetPosition.inSeconds,
      },
    );
  }

  Future<void> logMediaComplete({
    required String id,
    required Duration duration,
  }) async {
    unawaitedFlush(completed: true, endPositionSeconds: duration.inSeconds);
    await _analyticsService.logEvent(
      'media_complete',
      parameters: {
        'media_id': id,
        'duration_seconds': duration.inSeconds,
      },
    );
  }

  Future<void> logMediaStop({
    required String id,
  }) async {
    unawaitedFlush(completed: false);
    await _analyticsService.logEvent(
      'media_stop',
      parameters: {
        'media_id': id,
      },
    );
  }

  Future<void> logMediaDownload({
    required String id,
    required String title,
    String? mediaType,
  }) async {
    await _analyticsService.logEvent(
      'media_download',
      parameters: {
        'media_id': id,
        'media_title': title,
        if (mediaType != null) 'media_type': mediaType,
      },
    );
  }

  Future<void> logMediaError({
    required String id,
    required String error,
  }) async {
    await _analyticsService.logEvent(
      'media_error',
      parameters: {
        'media_id': id,
        'error_message': error,
      },
    );
  }
}
