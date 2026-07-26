import '../../../../core/utils/result.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/audio_filter_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';
import '../../domain/repositories/audio_repository.dart';
import '../datasources/audio_data_source.dart';

class AudioRepositoryImpl implements AudioRepository {
  final AudioDataSource _dataSource;

  AudioRepositoryImpl(this._dataSource);

  @override
  Future<Result<List<AudioEntity>>> getLatestAudio() async {
    try {
      final res = await _dataSource.getLatestAudio();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioEntity>>> getFeaturedAudio() async {
    try {
      final res = await _dataSource.getFeaturedAudio();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioEntity>>> getPopularAudio() async {
    try {
      final res = await _dataSource.getPopularAudio();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<AudioEntity>> getAudioDetails(String id) async {
    try {
      final res = await _dataSource.getAudioDetails(id);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioEntity>>> searchAudio(String query) async {
    try {
      final res = await _dataSource.searchAudio(query);
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
      final res = await _dataSource.filterAudio(filter);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<RecentlyPlayedEntity>>> getRecentlyPlayed() async {
    try {
      final res = await _dataSource.getRecentlyPlayed();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<FavoriteAudioEntity>>> getFavorites() async {
    try {
      final res = await _dataSource.getFavorites();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<bool>> toggleFavoriteAudio(String audioId) async {
    try {
      final res = await _dataSource.toggleFavoriteAudio(audioId);
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<List<AudioCategoryEntity>>> getCategories() async {
    try {
      final res = await _dataSource.getCategories();
      return Result.success(res);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
