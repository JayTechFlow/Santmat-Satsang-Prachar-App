import '../../../../core/utils/result.dart';
import '../entities/audio_entity.dart';
import '../entities/audio_category_entity.dart';
import '../entities/audio_filter_entity.dart';
import '../entities/recently_played_entity.dart';
import '../entities/favorite_audio_entity.dart';
import '../repositories/audio_repository.dart';

class GetLatestAudioUseCase {
  final AudioRepository repository;
  GetLatestAudioUseCase(this.repository);
  Future<Result<List<AudioEntity>>> call() => repository.getLatestAudio();
}

class GetFeaturedAudioUseCase {
  final AudioRepository repository;
  GetFeaturedAudioUseCase(this.repository);
  Future<Result<List<AudioEntity>>> call() => repository.getFeaturedAudio();
}

class GetPopularAudioUseCase {
  final AudioRepository repository;
  GetPopularAudioUseCase(this.repository);
  Future<Result<List<AudioEntity>>> call() => repository.getPopularAudio();
}

class GetAudioDetailsUseCase {
  final AudioRepository repository;
  GetAudioDetailsUseCase(this.repository);
  Future<Result<AudioEntity>> call(String id) => repository.getAudioDetails(id);
}

class SearchAudioUseCase {
  final AudioRepository repository;
  SearchAudioUseCase(this.repository);
  Future<Result<List<AudioEntity>>> call(String query) =>
      repository.searchAudio(query);
}

class FilterAudioUseCase {
  final AudioRepository repository;
  FilterAudioUseCase(this.repository);
  Future<Result<List<AudioEntity>>> call(AudioFilterEntity filter) =>
      repository.filterAudio(filter);
}

class GetRecentlyPlayedUseCase {
  final AudioRepository repository;
  GetRecentlyPlayedUseCase(this.repository);
  Future<Result<List<RecentlyPlayedEntity>>> call() =>
      repository.getRecentlyPlayed();
}

class GetFavoritesUseCase {
  final AudioRepository repository;
  GetFavoritesUseCase(this.repository);
  Future<Result<List<FavoriteAudioEntity>>> call() => repository.getFavorites();
}

class ToggleFavoriteAudioUseCase {
  final AudioRepository repository;
  ToggleFavoriteAudioUseCase(this.repository);
  Future<Result<bool>> call(String audioId) =>
      repository.toggleFavoriteAudio(audioId);
}

class GetAudioCategoriesUseCase {
  final AudioRepository repository;
  GetAudioCategoriesUseCase(this.repository);
  Future<Result<List<AudioCategoryEntity>>> call() =>
      repository.getCategories();
}
