import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../models/recommendation_dto.dart';

abstract class RecommendationDataSource {
  Future<List<RecommendationDto>> getRecommendations({
    String? category,
    String? type,
  });
}

class FirestoreRecommendationDataSource implements RecommendationDataSource {
  final FirestoreService firestore;

  FirestoreRecommendationDataSource(this.firestore);

  @override
  Future<List<RecommendationDto>> getRecommendations({
    String? category,
    String? type,
  }) async {
    List<Map<String, dynamic>> docs;
    if (category != null && category.isNotEmpty) {
      final snapshot = await firestore.queryCollection(
        FirestoreCollections.recommendations,
        (ref) => ref.where('category', isEqualTo: category),
      );
      docs = snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } else {
      final snapshot = await firestore.getCollection(FirestoreCollections.recommendations);
      docs = snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    }

    final items = docs.map((d) => RecommendationDto.fromJson(d)).toList();
    if (type != null && type.isNotEmpty) {
      return items.where((i) => i.type.toLowerCase() == type.toLowerCase()).toList();
    }
    return items;
  }
}

class MockRecommendationDataSource implements RecommendationDataSource {
  @override
  Future<List<RecommendationDto>> getRecommendations({
    String? category,
    String? type,
  }) async {
    final mockList = [
      const RecommendationDto(
        id: 'rec_1',
        title: 'Daily Meditation Guide',
        subtitle: 'By Maharishi Santsewi Ji',
        category: 'Meditation',
        type: 'audio',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
        targetId: 'audio_1',
        score: 0.98,
        reason: 'Based on your recent listening',
        durationSeconds: 900,
        tags: ['meditation', 'daily', 'spiritual'],
      ),
      const RecommendationDto(
        id: 'rec_2',
        title: 'Understanding Satsang Discourse',
        subtitle: 'Live Discourses Collection',
        category: 'Satsang',
        type: 'satsang',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
        targetId: 'satsang_1',
        score: 0.95,
        reason: 'Trending Satsang of the Week',
        durationSeconds: 1800,
        tags: ['satsang', 'discourse', 'santmat'],
      ),
      const RecommendationDto(
        id: 'rec_3',
        title: 'Moksha Darshan Chapter 3',
        subtitle: 'Sacred Literature',
        category: 'Books',
        type: 'book',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
        targetId: 'book_1',
        score: 0.92,
        reason: 'Top Rated Reading',
        durationSeconds: 1200,
        tags: ['book', 'philosophy', 'moksha'],
      ),
      const RecommendationDto(
        id: 'rec_4',
        title: 'Morning Bhajans & Stuti',
        subtitle: 'Peaceful Chants',
        category: 'Audio',
        type: 'playlist',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        targetId: 'smart_playlist_morning',
        score: 0.90,
        reason: 'Recommended for Morning',
        durationSeconds: 2400,
        tags: ['stuti', 'morning', 'chant'],
      ),
    ];

    if (category != null && category.isNotEmpty) {
      final filtered = mockList.where((i) => i.category.toLowerCase() == category.toLowerCase()).toList();
      return filtered.isNotEmpty ? filtered : mockList;
    }

    if (type != null && type.isNotEmpty) {
      final filtered = mockList.where((i) => i.type.toLowerCase() == type.toLowerCase()).toList();
      return filtered.isNotEmpty ? filtered : mockList;
    }

    return mockList;
  }
}
