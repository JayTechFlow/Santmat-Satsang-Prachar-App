import '../../../../core/utils/result.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/audio_filter_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';
import '../../domain/repositories/audio_repository.dart';
import '../datasources/mock_audio_data_source.dart';

class AudioRepositoryImpl implements AudioRepository {
  final MockAudioDataSource dataSource;

  AudioRepositoryImpl(this.dataSource);

  @override
  Future<Result<List<AudioEntity>>> getLatestAudio() async {
    try {
      final res = await dataSource.getLatestAudio();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioEntity>>> getFeaturedAudio() async {
    try {
      final res = await dataSource.getFeaturedAudio();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioEntity>>> getPopularAudio() async {
    try {
      final res = await dataSource.getPopularAudio();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<AudioEntity>> getAudioDetails(String id) async {
    try {
      final res = await dataSource.getAudioDetails(id);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioEntity>>> searchAudio(String query) async {
    try {
      final res = await dataSource.searchAudio(query);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioEntity>>> filterAudio(
    AudioFilterEntity filter,
  ) async {
    try {
      final res = await dataSource.filterAudio(filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<RecentlyPlayedEntity>>> getRecentlyPlayed() async {
    try {
      final res = await dataSource.getRecentlyPlayed();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<FavoriteAudioEntity>>> getFavorites() async {
    try {
      final res = await dataSource.getFavorites();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<bool>> toggleFavoriteAudio(String audioId) async {
    try {
      final res = await dataSource.toggleFavoriteAudio(audioId);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioCategoryEntity>>> getCategories() async {
    try {
      final res = await dataSource.getCategories();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
