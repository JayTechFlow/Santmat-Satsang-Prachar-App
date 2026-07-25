import '../../../../core/utils/result.dart';
import '../entities/audio_entity.dart';
import '../entities/audio_category_entity.dart';
import '../entities/audio_filter_entity.dart';
import '../entities/recently_played_entity.dart';
import '../entities/favorite_audio_entity.dart';

abstract class AudioRepository {
  Future<Result<List<AudioEntity>>> getLatestAudio();
  Future<Result<List<AudioEntity>>> getFeaturedAudio();
  Future<Result<List<AudioEntity>>> getPopularAudio();
  Future<Result<AudioEntity>> getAudioDetails(String id);
  Future<Result<List<AudioEntity>>> searchAudio(String query);
  Future<Result<List<AudioEntity>>> filterAudio(AudioFilterEntity filter);
  Future<Result<List<RecentlyPlayedEntity>>> getRecentlyPlayed();
  Future<Result<List<FavoriteAudioEntity>>> getFavorites();
  Future<Result<bool>> toggleFavoriteAudio(String audioId);
  Future<Result<List<AudioCategoryEntity>>> getCategories();
}
