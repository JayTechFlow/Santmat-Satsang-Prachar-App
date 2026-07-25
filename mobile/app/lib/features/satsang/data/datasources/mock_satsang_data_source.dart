import '../../domain/entities/satsang_entity.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../domain/entities/speaker_entity.dart';
import '../../domain/entities/satsang_filter_entity.dart';

class MockSatsangDataSource {
  final List<SatsangCategoryEntity> _categories = const [
    SatsangCategoryEntity(id: 'c1', name: 'Meditation'),
    SatsangCategoryEntity(id: 'c2', name: 'Philosophy'),
    SatsangCategoryEntity(id: 'c3', name: 'Daily Living'),
  ];

  final List<SpeakerEntity> _speakers = const [
    SpeakerEntity(
      id: 's1',
      name: 'Maharshi Mehi Paramhans',
      photoUrl: 'https://i.pravatar.cc/150?u=mehi',
    ),
    SpeakerEntity(
      id: 's2',
      name: 'Sant Tulsi Sahib',
      photoUrl: 'https://i.pravatar.cc/150?u=tulsi',
    ),
  ];

  late final List<SatsangEntity> _satsangs = [
    SatsangEntity(
      id: '1',
      title: 'Inner Peace through Meditation',
      subtitle: 'A guide to inner silence',
      description:
          'Detailed explanation of meditation techniques according to Santmat.',
      speaker: _speakers[0],
      category: _categories[0],
      duration: const Duration(minutes: 45),
      language: 'Hindi',
      date: DateTime.now().subtract(const Duration(days: 2)),
      location: 'Kuppaghat, Bhagalpur',
      thumbnailUrl: 'https://picsum.photos/seed/sat1/400/300',
      coverImageUrl: 'https://picsum.photos/seed/sat1/800/400',
      tags: const ['meditation', 'peace', 'inner-journey'],
      isFeatured: true,
      isPopular: true,
      isRecentlyAdded: true,
    ),
    SatsangEntity(
      id: '2',
      title: 'The Path of Devotion',
      subtitle: 'Bhakti Yoga',
      description:
          'Understanding the importance of devotion in spiritual progress.',
      speaker: _speakers[1],
      category: _categories[1],
      duration: const Duration(minutes: 60),
      language: 'Hindi',
      date: DateTime.now().subtract(const Duration(days: 10)),
      location: 'Mathura',
      thumbnailUrl: 'https://picsum.photos/seed/sat2/400/300',
      coverImageUrl: 'https://picsum.photos/seed/sat2/800/400',
      tags: const ['bhakti', 'devotion'],
      isFeatured: false,
      isPopular: true,
      isRecentlyAdded: false,
    ),
  ];

  Future<List<SatsangEntity>> getLatestSatsangs() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _satsangs.where((s) => s.isRecentlyAdded).toList();
  }

  Future<List<SatsangEntity>> getFeaturedSatsangs() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _satsangs.where((s) => s.isFeatured).toList();
  }

  Future<List<SatsangEntity>> getPopularSatsangs() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _satsangs.where((s) => s.isPopular).toList();
  }

  Future<SatsangEntity> getSatsangDetails(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _satsangs.firstWhere(
      (s) => s.id == id,
      orElse: () => throw Exception('Satsang not found'),
    );
  }

  Future<List<SatsangEntity>> searchSatsangs(String query) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final q = query.toLowerCase();
    return _satsangs.where((s) {
      return s.title.toLowerCase().contains(q) ||
          s.speaker.name.toLowerCase().contains(q) ||
          s.category.name.toLowerCase().contains(q);
    }).toList();
  }

  Future<List<SatsangEntity>> filterSatsangs(SatsangFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _satsangs.where((s) {
      if (filter.categoryId != null && s.category.id != filter.categoryId) {
        return false;
      }
      if (filter.speakerId != null && s.speaker.id != filter.speakerId) {
        return false;
      }
      if (filter.language != null && s.language != filter.language) {
        return false;
      }
      if (filter.isFeatured != null && s.isFeatured != filter.isFeatured) {
        return false;
      }
      if (filter.isPopular != null && s.isPopular != filter.isPopular) {
        return false;
      }
      if (filter.searchQuery != null) {
        final q = filter.searchQuery!.toLowerCase();
        if (!s.title.toLowerCase().contains(q) &&
            !s.speaker.name.toLowerCase().contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  Future<List<SatsangCategoryEntity>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _categories;
  }
}
