import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/recently_played_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/favorite_audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/repositories/audio_repository.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/usecases/audio_usecases.dart';

class MockAudioRepository implements AudioRepository {
  @override
  Future<Result<List<AudioEntity>>> getLatestAudio() async =>
      const Result.success([]);

  @override
  Future<Result<List<AudioEntity>>> getFeaturedAudio() async =>
      const Result.success([]);

  @override
  Future<Result<List<AudioEntity>>> getPopularAudio() async =>
      const Result.success([]);

  @override
  Future<Result<AudioEntity>> getAudioDetails(String id) async =>
      throw UnimplementedError();

  @override
  Future<Result<List<AudioEntity>>> searchAudio(String query) async =>
      const Result.success([]);

  @override
  Future<Result<List<AudioEntity>>> filterAudio(
    AudioFilterEntity filter,
  ) async => const Result.success([]);

  @override
  Future<Result<List<RecentlyPlayedEntity>>> getRecentlyPlayed() async =>
      const Result.success([]);

  @override
  Future<Result<List<FavoriteAudioEntity>>> getFavorites() async =>
      const Result.success([]);

  @override
  Future<Result<bool>> toggleFavoriteAudio(String audioId) async =>
      const Result.success(true);

  @override
  Future<Result<List<AudioCategoryEntity>>> getCategories() async =>
      const Result.success([]);
}

void main() {
  late MockAudioRepository repository;
  late GetLatestAudioUseCase getLatestUseCase;
  late GetFeaturedAudioUseCase getFeaturedUseCase;

  setUp(() {
    repository = MockAudioRepository();
    getLatestUseCase = GetLatestAudioUseCase(repository);
    getFeaturedUseCase = GetFeaturedAudioUseCase(repository);
  });

  test('GetLatestAudioUseCase returns success', () async {
    final result = await getLatestUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });

  test('GetFeaturedAudioUseCase returns success', () async {
    final result = await getFeaturedUseCase();
    expect(result.isSuccess, true);
    expect(result.data, isEmpty);
  });
}
