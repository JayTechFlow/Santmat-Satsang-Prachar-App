import 'dart:math';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// Reports playback sessions and activity heartbeats to the analytics
/// Cloud Functions so the Admin Reports centre has a Firestore-readable source
/// of truth for plays and listening time.
///
/// Before this existed, listening analytics were written only to Google
/// Analytics 4, which Firestore cannot read. The Admin panel therefore had no
/// queryable source for plays or playtime and could only ever show structural
/// zeros.
///
/// Design notes:
///  - Listening time is accumulated as wall-clock seconds during which the
///    player was in a playing state. Paused time is excluded. This is the same
///    quantity `media_pause` positions imply, but measured directly so it does
///    not require interpolating player position updates.
///  - [sessionId] is the server-side idempotency key. Re-reporting the same
///    session (retry, reconnect, duplicate dispatch) overwrites rather than
///    double-counts.
///  - Every call is best-effort: analytics must never break playback, so
///    failures are swallowed rather than surfaced to the user.
class PlaybackSessionReporter {
  PlaybackSessionReporter({
    FirebaseFunctions? functionsOverride,
    FirebaseAuth? authOverride,
  })  : _functionsOverride = functionsOverride,
        _authOverride = authOverride;

  static const String _recordFunction = 'analytics-recordPlaybackSession';
  static const String _heartbeatFunction = 'analytics-touchActiveUser';

  /// Matches the server-side SESSION_ID_PATTERN: [A-Za-z0-9_-]{8,64}.
  static const String _idAlphabet =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

  final FirebaseFunctions? _functionsOverride;
  final FirebaseAuth? _authOverride;
  final Random _random = Random();

  FirebaseFunctions get _functions => _functionsOverride ?? FirebaseFunctions.instance;
  FirebaseAuth get _auth => _authOverride ?? FirebaseAuth.instance;

  /// Generates a session id that satisfies the server contract.
  String generateSessionId() {
    final buffer = StringBuffer();
    for (var i = 0; i < 22; i++) {
      buffer.write(_idAlphabet[_random.nextInt(_idAlphabet.length)]);
    }
    return buffer.toString();
  }

  /// Report a finished playback session.
  ///
  /// [listenedSeconds] is the accumulated listening time for the session.
  /// Returns true when the server accepted the event.
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
    try {
      if (_auth.currentUser == null) {
        return false;
      }
      final callable = _functions.httpsCallable(
        _recordFunction,
        options: HttpsCallableOptions(timeout: const Duration(seconds: 15)),
      );
      await callable.call(<String, dynamic>{
        'sessionId': sessionId,
        'contentId': contentId,
        'contentType': contentType,
        if (category != null) 'category': category,
        'startedAt': startedAtMs,
        'listenedSeconds': listenedSeconds < 0 ? 0 : listenedSeconds,
        if (mediaDurationSeconds != null) 'mediaDurationSeconds': mediaDurationSeconds,
        if (endPositionSeconds != null) 'endPositionSeconds': endPositionSeconds,
        'completed': completed,
      });
      return true;
    } catch (_) {
      // Analytics are non-critical; never surface to the user.
      return false;
    }
  }

  /// Refresh the user's activity heartbeat, which is what makes the Admin
  /// "Active Users" figure an exact-realtime signal instead of an inference.
  Future<bool> touchActiveUser() async {
    try {
      if (_auth.currentUser == null) {
        return false;
      }
      final callable = _functions.httpsCallable(
        _heartbeatFunction,
        options: HttpsCallableOptions(timeout: const Duration(seconds: 10)),
      );
      await callable.call(<String, dynamic>{});
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Alias used by the app-lifecycle heartbeat widget.
  Future<bool> ping() => touchActiveUser();
}