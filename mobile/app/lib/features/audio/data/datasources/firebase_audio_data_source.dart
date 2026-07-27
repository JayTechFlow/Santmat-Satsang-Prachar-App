import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/audio_entity.dart';
import '../../domain/entities/audio_category_entity.dart';
import '../../domain/entities/audio_filter_entity.dart';
import '../../domain/entities/recently_played_entity.dart';
import '../../domain/entities/favorite_audio_entity.dart';
import '../models/audio_dto.dart';
import 'audio_data_source.dart';

class FirebaseAudioDataSource implements AudioDataSource {
  final FirebaseFirestore _firestore;

  FirebaseAudioDataSource(this._firestore);

  @override
  Future<List<AudioEntity>> getLatestAudio() async {
    final snapshot = await _firestore
        .collection('audio')
        .orderBy('releaseDate', descending: true)
        .limit(20)
        .get();
    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<AudioEntity>> getFeaturedAudio() async {
    final snapshot = await _firestore
        .collection('audio')
        .where('isFeatured', isEqualTo: true)
        .get();
    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<AudioEntity>> getPopularAudio() async {
    final snapshot = await _firestore
        .collection('audio')
        .where('isPopular', isEqualTo: true)
        .get();
    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<AudioEntity> getAudioDetails(String id) async {
    final doc = await _firestore.collection('audio').doc(id).get();
    if (!doc.exists) {
      throw Exception('Audio not found');
    }
    return AudioDto.fromFirestore(doc).toEntity();
  }

  @override
  Future<List<AudioEntity>> searchAudio(String query) async {
    // Basic implementation; for real search consider Algolia or Typesense
    final snapshot = await _firestore
        .collection('audio')
        .where('title', isGreaterThanOrEqualTo: query)
        .where('title', isLessThanOrEqualTo: '$query\\uf8ff')
        .get();
    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<AudioEntity>> filterAudio(AudioFilterEntity filter) async {
    Query query = _firestore.collection('audio');

    if (filter.categoryId != null) {
      query = query.where('categoryId', isEqualTo: filter.categoryId);
    }
    
    // Additional filters can be applied here based on AudioFilterEntity properties

    final snapshot = await query.get();
    return snapshot.docs
        .map((doc) => AudioDto.fromFirestore(doc as DocumentSnapshot<Map<String, dynamic>>).toEntity())
        .toList();
  }

  @override
  Future<List<AudioCategoryEntity>> getCategories() async {
    final snapshot = await _firestore.collection('audio_categories').get();
    return snapshot.docs.map((doc) {
      final data = doc.data();
      return AudioCategoryEntity(
        id: doc.id,
        name: data['name'] as String? ?? '',
        imageUrl: data['imageUrl'] as String?,
      );
    }).toList();
  }

  @override
  Future<List<FavoriteAudioEntity>> getFavorites() async {
    // Needs user authentication context in a real app
    final snapshot = await _firestore.collection('favorites').get();
    
    // We would need to fetch the audio entities as well, or just return empty for dummy
    // Since this is dummy without full relational fetch, we'll return empty for now
    // or fetch the AudioEntity separately. 
    return [];
  }

  @override
  Future<bool> toggleFavoriteAudio(String id) async {
    // Dummy implementation, requires auth
    return true;
  }

  @override
  Future<List<RecentlyPlayedEntity>> getRecentlyPlayed() async {
    // Dummy implementation, requires auth
    return [];
  }
}
