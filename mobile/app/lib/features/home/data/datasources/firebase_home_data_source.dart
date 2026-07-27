import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/featured_banner_entity.dart';
import '../../domain/entities/featured_book_entity.dart';
import '../../domain/entities/home_dashboard_entity.dart';
import '../../domain/entities/latest_audio_entity.dart';
import '../../domain/entities/latest_satsang_entity.dart';
import '../../domain/entities/quick_action_entity.dart';
import '../../domain/entities/upcoming_event_entity.dart';
import '../datasources/mock_home_data_source.dart';
import 'home_data_source.dart';

class FirebaseHomeDataSource implements HomeDataSource {
  final FirebaseFirestore _firestore;

  FirebaseHomeDataSource(this._firestore);

  Future<HomeDashboardEntity> getHomeDashboard() async {
    // Attempt to fetch from Firebase, fallback to Mock if empty or errors for seamless dev experience
    try {
      final futures = await Future.wait([
        _firestore.collection(FirestoreCollections.dailyQuotes).where('active', isEqualTo: true).limit(1).get(),
        _firestore.collection(FirestoreCollections.banners).where('active', isEqualTo: true).orderBy('order').get(),
        _firestore.collection(FirestoreCollections.quickActions).where('active', isEqualTo: true).orderBy('order').get(),
        _firestore.collection(FirestoreCollections.satsangs).orderBy('date', descending: true).limit(3).get(),
        _firestore.collection(FirestoreCollections.events).where('startDate', isGreaterThanOrEqualTo: DateTime.now().toIso8601String()).limit(3).get(),
        _firestore.collection(FirestoreCollections.audio).orderBy('date', descending: true).limit(5).get(),
        _firestore.collection(FirestoreCollections.books).where('featured', isEqualTo: true).limit(5).get(),
      ]);

      final quotesSnapshot = futures[0];
      final bannersSnapshot = futures[1];
      final quickActionsSnapshot = futures[2];
      final satsangsSnapshot = futures[3];
      final eventsSnapshot = futures[4];
      final audiosSnapshot = futures[5];
      final booksSnapshot = futures[6];

      // If everything is completely empty, it means DB isn't seeded yet. 
      // Return mock data temporarily while the CMS is being built!
      if (bannersSnapshot.docs.isEmpty && audiosSnapshot.docs.isEmpty) {
        return MockHomeDataSource().getHomeDashboard();
      }

      DailyQuoteEntity? dailyQuote;
      if (quotesSnapshot.docs.isNotEmpty) {
        final doc = quotesSnapshot.docs.first.data();
        dailyQuote = DailyQuoteEntity(
          id: quotesSnapshot.docs.first.id,
          quoteText: doc['quoteText'] ?? '',
          author: doc['author'] ?? '',
          date: (doc['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
        );
      }

      final banners = bannersSnapshot.docs.map((doc) {
        final data = doc.data();
        return FeaturedBannerEntity(
          id: doc.id,
          title: data['title'] ?? '',
          imageUrl: data['imageUrl'] ?? '',
        );
      }).toList();

      final quickActions = quickActionsSnapshot.docs.map((doc) {
        final data = doc.data();
        return QuickActionEntity(
          id: doc.id,
          title: data['title'] ?? '',
          iconName: data['iconName'] ?? '',
          route: data['route'] ?? '',
        );
      }).toList();

      final latestSatsangs = satsangsSnapshot.docs.map((doc) {
        final data = doc.data();
        return LatestSatsangEntity(
          id: doc.id,
          title: data['title'] ?? '',
          speaker: data['speakerName'] ?? '',
          date: (data['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
          thumbnailUrl: data['thumbnailUrl'] ?? '',
          videoUrl: data['videoUrl'] ?? '',
          duration: Duration(minutes: data['durationMinutes'] ?? 0),
        );
      }).toList();

      final upcomingEvents = eventsSnapshot.docs.map((doc) {
        final data = doc.data();
        return UpcomingEventEntity(
          id: doc.id,
          title: data['title'] ?? '',
          location: data['location'] ?? '',
          startDate: DateTime.parse(data['startDate']),
          endDate: DateTime.parse(data['endDate']),
        );
      }).toList();

      final latestAudios = audiosSnapshot.docs.map((doc) {
        final data = doc.data();
        return LatestAudioEntity(
          id: doc.id,
          title: data['title'] ?? '',
          speaker: data['speaker'] ?? '',
          audioUrl: data['audioUrl'] ?? '',
          duration: Duration(minutes: data['durationMinutes'] ?? 0),
        );
      }).toList();

      final featuredBooks = booksSnapshot.docs.map((doc) {
        final data = doc.data();
        return FeaturedBookEntity(
          id: doc.id,
          title: data['title'] ?? '',
          author: data['author'] ?? '',
          coverImageUrl: data['coverImageUrl'] ?? '',
        );
      }).toList();

      return HomeDashboardEntity(
        notificationCount: 0, // Should come from a user-specific query
        dailyQuote: dailyQuote,
        banners: banners,
        quickActions: quickActions,
        latestSatsangs: latestSatsangs,
        upcomingEvents: upcomingEvents,
        latestAudios: latestAudios,
        featuredBooks: featuredBooks,
      );
    } catch (e) {
      // Return mock data if there's any permission issue or network error while setting up CMS
      return MockHomeDataSource().getHomeDashboard();
    }
  }
}
