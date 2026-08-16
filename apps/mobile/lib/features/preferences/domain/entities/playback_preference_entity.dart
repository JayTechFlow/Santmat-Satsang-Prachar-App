class PlaybackPreferenceEntity {
  final bool autoPlay;
  final double playbackSpeed;
  final bool backgroundAudio;
  final bool continueFromLastPosition;

  const PlaybackPreferenceEntity({
    required this.autoPlay,
    required this.playbackSpeed,
    required this.backgroundAudio,
    required this.continueFromLastPosition,
  });

  PlaybackPreferenceEntity copyWith({
    bool? autoPlay,
    double? playbackSpeed,
    bool? backgroundAudio,
    bool? continueFromLastPosition,
  }) {
    return PlaybackPreferenceEntity(
      autoPlay: autoPlay ?? this.autoPlay,
      playbackSpeed: playbackSpeed ?? this.playbackSpeed,
      backgroundAudio: backgroundAudio ?? this.backgroundAudio,
      continueFromLastPosition:
          continueFromLastPosition ?? this.continueFromLastPosition,
    );
  }
}
