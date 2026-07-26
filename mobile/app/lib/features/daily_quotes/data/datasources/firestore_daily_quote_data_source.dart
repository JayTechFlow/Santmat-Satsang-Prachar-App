import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';
import '../../domain/entities/quote_filter_entity.dart';
import '../../domain/entities/favorite_quote_entity.dart';
import '../../domain/entities/quote_history_entity.dart';
import 'daily_quote_data_source.dart';
import '../models/daily_quote_dto.dart';

class FirestoreDailyQuoteDataSource implements DailyQuoteDataSource {
  final FirestoreService _firestoreService;

  FirestoreDailyQuoteDataSource(this._firestoreService);

  @override
  Future<DailyQuoteEntity> getTodayQuote() async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.dailyQuotes,
      (q) => q.where('isDaily', isEqualTo: true).limit(1),
    );
    if (snapshot.docs.isEmpty) {
      final all = await _firestoreService.queryCollection(
        FirestoreCollections.dailyQuotes,
        (q) => q.limit(1),
      );
      if (all.docs.isEmpty) throw Exception('No quotes found');
      return QuoteDto.fromFirestore(all.docs.first).toEntity();
    }
    return QuoteDto.fromFirestore(snapshot.docs.first).toEntity();
  }

  @override
  Future<DailyQuoteEntity> getRandomQuote() async {
    // In a real app, getting a truly random quote from Firestore is tricky.
    // For now, just getting a few and picking one or just returning the first.
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.dailyQuotes,
      (q) => q.limit(1),
    );
    if (snapshot.docs.isEmpty) throw Exception('No quotes found');
    return QuoteDto.fromFirestore(snapshot.docs.first).toEntity();
  }

  @override
  Future<List<DailyQuoteEntity>> getFeaturedQuotes() async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.dailyQuotes,
      (q) => q.where('isFeatured', isEqualTo: true),
    );
    return snapshot.docs
        .map((doc) => QuoteDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<DailyQuoteEntity>> searchQuotes(String query) async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.dailyQuotes,
      (q) => q
          .where('quoteText', isGreaterThanOrEqualTo: query)
          .where('quoteText', isLessThanOrEqualTo: '$query\uf8ff'),
    );
    return snapshot.docs
        .map((doc) => QuoteDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<DailyQuoteEntity>> filterQuotes(QuoteFilterEntity filter) async {
    final snapshot = await _firestoreService.queryCollection(
      FirestoreCollections.dailyQuotes,
      (q) {
        var query = q as Query<Map<String, dynamic>>;
        if (filter.categoryId != null) {
          query = query.where('category.id', isEqualTo: filter.categoryId);
        }
        if (filter.authorId != null) {
          query = query.where('author.id', isEqualTo: filter.authorId);
        }
        if (filter.language != null) {
          query = query.where('language', isEqualTo: filter.language);
        }
        if (filter.isFeatured != null) {
          query = query.where('isFeatured', isEqualTo: filter.isFeatured);
        }
        if (filter.isDaily != null) {
          query = query.where('isDaily', isEqualTo: filter.isDaily);
        }
        return query;
      },
    );
    return snapshot.docs
        .map((doc) => QuoteDto.fromFirestore(doc).toEntity())
        .toList();
  }

  @override
  Future<List<QuoteCategoryEntity>> getCategories() async {
    // Assuming you have a collection for quote categories or reuse the same logic
    return [];
  }

  @override
  Future<List<QuoteAuthorEntity>> getAuthors() async {
    return [];
  }

  @override
  Future<List<FavoriteQuoteEntity>> getFavoriteQuotes() async {
    return [];
  }

  @override
  Future<bool> toggleFavoriteQuote(String quoteId) async {
    return false;
  }

  @override
  Future<List<QuoteHistoryEntity>> getQuoteHistory() async {
    return [];
  }

  @override
  Future<void> addToHistory(String quoteId) async {}
}
