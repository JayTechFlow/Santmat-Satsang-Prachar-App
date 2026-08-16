import 'package:santmat_satsang_prachar/features/audio/data/datasources/audio_data_source.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/recently_played_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/favorite_audio_entity.dart';

class MockAudioDataSource implements AudioDataSource {
  final dummyAudio = AudioEntity(
    id: '1',
    title: 'Test Audio',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    speaker: 'Test Speaker',
    category: const AudioCategoryEntity(id: '1', name: 'Test Category'),
    duration: const Duration(minutes: 5),
    language: 'Hindi',
    thumbnailUrl: 'https://test.com/image.jpg',
    artworkUrl: 'https://test.com/artwork.jpg',
    releaseDate: DateTime.now(),
    playCount: 100,
    favoriteCount: 10,
    isFeatured: true,
    isRecentlyAdded: true,
    isPopular: true,
    audioUrl: 'https://test.com/audio.mp3',
  );

  @override Future<List<AudioEntity>> getLatestAudio() async => [dummyAudio];
  @override Future<List<AudioEntity>> getFeaturedAudio() async => [dummyAudio];
  @override Future<List<AudioEntity>> getPopularAudio() async => [dummyAudio];
  @override Future<AudioEntity> getAudioDetails(String id) async => dummyAudio;
  @override Future<List<AudioEntity>> searchAudio(String query) async => [dummyAudio];
  @override Future<List<AudioEntity>> filterAudio(AudioFilterEntity filter) async => [dummyAudio];
  @override Future<List<AudioCategoryEntity>> getCategories() async => [
    const AudioCategoryEntity(id: '1', name: 'Test Category'),
  ];
  @override Future<List<FavoriteAudioEntity>> getFavorites() async => [
    FavoriteAudioEntity(audio: dummyAudio, favoritedAt: DateTime.now()),
  ];
  @override Future<bool> toggleFavoriteAudio(String id) async => true;
  @override Future<List<RecentlyPlayedEntity>> getRecentlyPlayed() async => [
    RecentlyPlayedEntity(audio: dummyAudio, playedAt: DateTime.now()),
  ];
}
