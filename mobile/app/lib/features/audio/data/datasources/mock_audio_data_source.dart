import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/audio_filter_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';

class MockAudioDataSource {
  final List<AudioCategoryEntity> _categories = [
    const AudioCategoryEntity(
      id: 'c1',
      name: 'Bhajan',
      description: 'Devotional songs',
    ),
    const AudioCategoryEntity(
      id: 'c2',
      name: 'Pravachan',
      description: 'Spiritual discourses',
    ),
    const AudioCategoryEntity(
      id: 'c3',
      name: 'Meditation',
      description: 'Guided meditation',
    ),
  ];

  late final List<AudioEntity> _audios;

  MockAudioDataSource() {
    _audios = List.generate(
      15,
      (index) => AudioEntity(
        id: 'audio_$index',
        title: 'Spiritual Audio ${index + 1}',
        subtitle: 'Subtitle ${index + 1}',
        description:
            'This is a detailed description for spiritual audio ${index + 1}. It contains deep insights.',
        speaker: index % 2 == 0 ? 'Maharshi Mehi' : 'Sant Tulsi Sahib',
        category: _categories[index % _categories.length],
        duration: Duration(minutes: 5 + (index * 2)),
        language: index % 3 == 0 ? 'English' : 'Hindi',
        thumbnailUrl: 'https://picsum.photos/seed/audio_$index/300/300',
        artworkUrl: 'https://picsum.photos/seed/audio_$index/600/600',
        releaseDate: DateTime.now().subtract(Duration(days: index * 5)),
        playCount: 1000 + (index * 50),
        favoriteCount: 100 + (index * 10),
        isFeatured: index < 5,
        isRecentlyAdded: index < 7,
        isPopular: index % 2 == 0,
        audioUrl:
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
      ),
    );
  }

  Future<List<AudioEntity>> getLatestAudio() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _audios.where((a) => a.isRecentlyAdded).toList();
  }

  Future<List<AudioEntity>> getFeaturedAudio() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _audios.where((a) => a.isFeatured).toList();
  }

  Future<List<AudioEntity>> getPopularAudio() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _audios.where((a) => a.isPopular).toList();
  }

  Future<AudioEntity> getAudioDetails(String id) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _audios.firstWhere((a) => a.id == id);
  }

  Future<List<AudioEntity>> searchAudio(String query) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final q = query.toLowerCase();
    return _audios.where((a) {
      return a.title.toLowerCase().contains(q) ||
          a.speaker.toLowerCase().contains(q);
    }).toList();
  }

  Future<List<AudioEntity>> filterAudio(AudioFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _audios.where((a) {
      if (filter.categoryId != null && a.category.id != filter.categoryId) {
        return false;
      }
      if (filter.speaker != null && a.speaker != filter.speaker) {
        return false;
      }
      if (filter.language != null && a.language != filter.language) {
        return false;
      }
      if (filter.isFeatured != null && a.isFeatured != filter.isFeatured) {
        return false;
      }
      if (filter.isPopular != null && a.isPopular != filter.isPopular) {
        return false;
      }
      if (filter.isRecentlyAdded != null &&
          a.isRecentlyAdded != filter.isRecentlyAdded) {
        return false;
      }
      if (filter.searchQuery != null) {
        final q = filter.searchQuery!.toLowerCase();
        if (!a.title.toLowerCase().contains(q) &&
            !a.speaker.toLowerCase().contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  Future<List<AudioCategoryEntity>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _categories;
  }

  // Mocking favorites and recently played in memory
  final Set<String> _favoriteIds = {'audio_0', 'audio_2'};
  final List<RecentlyPlayedEntity> _recentlyPlayed = [];

  Future<List<FavoriteAudioEntity>> getFavorites() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _audios
        .where((a) => _favoriteIds.contains(a.id))
        .map((a) => FavoriteAudioEntity(audio: a, favoritedAt: DateTime.now()))
        .toList();
  }

  Future<bool> toggleFavoriteAudio(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (_favoriteIds.contains(id)) {
      _favoriteIds.remove(id);
      return false;
    } else {
      _favoriteIds.add(id);
      return true;
    }
  }

  Future<List<RecentlyPlayedEntity>> getRecentlyPlayed() async {
    await Future.delayed(const Duration(milliseconds: 400));
    if (_recentlyPlayed.isEmpty) {
      _recentlyPlayed.addAll(
        _audios
            .take(3)
            .map(
              (a) => RecentlyPlayedEntity(
                audio: a,
                playedAt: DateTime.now().subtract(const Duration(hours: 1)),
              ),
            ),
      );
    }
    return _recentlyPlayed;
  }
}
