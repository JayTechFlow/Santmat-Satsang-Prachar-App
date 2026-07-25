import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/audio_filter_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';

abstract class AudioDataSource {
  Future<List<AudioEntity>> getLatestAudio();
  Future<List<AudioEntity>> getFeaturedAudio();
  Future<List<AudioEntity>> getPopularAudio();
  Future<AudioEntity> getAudioDetails(String id);
  Future<List<AudioEntity>> searchAudio(String query);
  Future<List<AudioEntity>> filterAudio(AudioFilterEntity filter);
  Future<List<AudioCategoryEntity>> getCategories();
  Future<List<FavoriteAudioEntity>> getFavorites();
  Future<bool> toggleFavoriteAudio(String id);
  Future<List<RecentlyPlayedEntity>> getRecentlyPlayed();
}
