import 'package:santmat_satsang_prachar/core/services/firebase_analytics_service.dart';

class PlaybackAnalyticsService {
  final FirebaseAnalyticsService _analyticsService;

  PlaybackAnalyticsService(this._analyticsService);

  Future<void> logMediaPlay({
    required String id,
    required String title,
    String? mediaType,
    String? category,
  }) async {
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
    await _analyticsService.logEvent(
      'media_complete',
      parameters: {
        'media_id': id,
        'duration_seconds': duration.inSeconds,
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
