import 'audio_entity.dart';

enum PlaybackStatus { idle, loading, playing, paused, completed, error }

class PlaybackStateEntity {
  final AudioEntity? currentAudio;
  final PlaybackStatus status;
  final Duration position;
  final Duration buffered;
  final bool isShuffleEnabled;
  final bool isRepeatEnabled;
  final String? errorMessage;

  const PlaybackStateEntity({
    this.currentAudio,
    this.status = PlaybackStatus.idle,
    this.position = Duration.zero,
    this.buffered = Duration.zero,
    this.isShuffleEnabled = false,
    this.isRepeatEnabled = false,
    this.errorMessage,
  });

  PlaybackStateEntity copyWith({
    AudioEntity? currentAudio,
    PlaybackStatus? status,
    Duration? position,
    Duration? buffered,
    bool? isShuffleEnabled,
    bool? isRepeatEnabled,
    String? errorMessage,
  }) {
    return PlaybackStateEntity(
      currentAudio: currentAudio ?? this.currentAudio,
      status: status ?? this.status,
      position: position ?? this.position,
      buffered: buffered ?? this.buffered,
      isShuffleEnabled: isShuffleEnabled ?? this.isShuffleEnabled,
      isRepeatEnabled: isRepeatEnabled ?? this.isRepeatEnabled,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}
