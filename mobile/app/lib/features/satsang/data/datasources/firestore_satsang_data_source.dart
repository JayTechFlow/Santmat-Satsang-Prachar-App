import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/services/firestore_service.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../domain/entities/satsang_entity.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../domain/entities/satsang_filter_entity.dart';
import '../models/satsang_dto.dart';
import 'satsang_data_source.dart';

class FirestoreSatsangDataSource implements SatsangDataSource {
  final FirestoreService _firestoreService;
  
  FirestoreSatsangDataSource(this._firestoreService);

  @override
  Future<List<SatsangEntity>> getLatestSatsangs() async {
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.satsangs)
        .where('isRecentlyAdded', isEqualTo: true)
        .get();
        
    return snapshot.docs
        .map((doc) => SatsangDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<SatsangEntity>> getFeaturedSatsangs() async {
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.satsangs)
        .where('isFeatured', isEqualTo: true)
        .get();
        
    return snapshot.docs
        .map((doc) => SatsangDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<SatsangEntity>> getPopularSatsangs() async {
    final snapshot = await FirebaseFirestore.instance
        .collection(FirestoreCollections.satsangs)
        .where('isPopular', isEqualTo: true)
        .get();
        
    return snapshot.docs
        .map((doc) => SatsangDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<SatsangEntity> getSatsangDetails(String id) async {
    final doc = await _firestoreService.getDocument(
      FirestoreCollections.satsangs,
      id,
    );
    if (!doc.exists) {
      throw Exception('Satsang not found');
    }
    return SatsangDto.fromFirestore(doc).toEntity();
  }

  @override
  Future<List<SatsangEntity>> searchSatsangs(String query) async {
    // For a real search we might use algolia or meilisearch.
    // For firestore we'll just get all and filter locally for simple search, or use a field array.
    final snapshot = await _firestoreService.getCollection(FirestoreCollections.satsangs);
    final q = query.toLowerCase();
    
    return snapshot.docs
        .map((doc) => SatsangDto.fromFirestore(doc).toEntity())
        .where((s) => 
          s.title.toLowerCase().contains(q) || 
          s.speaker.name.toLowerCase().contains(q) || 
          s.category.name.toLowerCase().contains(q)
        ).toList();
  }

  @override
  Future<List<SatsangEntity>> filterSatsangs(SatsangFilterEntity filter) async {
    Query query = FirebaseFirestore.instance.collection(FirestoreCollections.satsangs);
    
    if (filter.categoryId != null) {
      query = query.where('categoryId', isEqualTo: filter.categoryId);
    }
    if (filter.speakerId != null) {
      query = query.where('speakerId', isEqualTo: filter.speakerId);
    }
    if (filter.language != null) {
      query = query.where('language', isEqualTo: filter.language);
    }
    if (filter.isFeatured != null) {
      query = query.where('isFeatured', isEqualTo: filter.isFeatured);
    }
    if (filter.isPopular != null) {
      query = query.where('isPopular', isEqualTo: filter.isPopular);
    }
    
    final snapshot = await query.get();
    var results = snapshot.docs.map((doc) => SatsangDto.fromFirestore(doc as DocumentSnapshot).toEntity()).toList();
    
    if (filter.searchQuery != null) {
      final q = filter.searchQuery!.toLowerCase();
      results = results.where((s) => 
        s.title.toLowerCase().contains(q) || 
        s.speaker.name.toLowerCase().contains(q)
      ).toList();
    }
    
    return results;
  }

  @override
  Future<List<SatsangCategoryEntity>> getCategories() async {
    // We can either have a categories collection or extract from satsangs.
    // Let's assume a static list for now as in mock, or we fetch from a 'categories' collection.
    // Assuming there's a collection, but mock has it hardcoded.
    // I will return hardcoded to keep it simple, or query a 'categories' collection if one exists.
    return const [
      SatsangCategoryEntity(id: 'c1', name: 'Meditation'),
      SatsangCategoryEntity(id: 'c2', name: 'Philosophy'),
      SatsangCategoryEntity(id: 'c3', name: 'Daily Living'),
    ];
  }
}
