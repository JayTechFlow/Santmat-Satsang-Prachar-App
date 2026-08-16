import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/recently_played_entity.dart';

class AudioHomeState {
  final bool isLoading;
  final String? error;
  final List<AudioEntity> featuredAudio;
  final List<AudioEntity> latestAudio;
  final List<AudioEntity> popularAudio;
  final List<AudioCategoryEntity> categories;
  final List<RecentlyPlayedEntity> recentlyPlayed;

  const AudioHomeState({
    this.isLoading = false,
    this.error,
    this.featuredAudio = const [],
    this.latestAudio = const [],
    this.popularAudio = const [],
    this.categories = const [],
    this.recentlyPlayed = const [],
  });

  AudioHomeState copyWith({
    bool? isLoading,
    String? error,
    List<AudioEntity>? featuredAudio,
    List<AudioEntity>? latestAudio,
    List<AudioEntity>? popularAudio,
    List<AudioCategoryEntity>? categories,
    List<RecentlyPlayedEntity>? recentlyPlayed,
  }) {
    return AudioHomeState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      featuredAudio: featuredAudio ?? this.featuredAudio,
      latestAudio: latestAudio ?? this.latestAudio,
      popularAudio: popularAudio ?? this.popularAudio,
      categories: categories ?? this.categories,
      recentlyPlayed: recentlyPlayed ?? this.recentlyPlayed,
    );
  }
}
