import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/featured_banner_entity.dart';
import '../../domain/entities/home_dashboard_entity.dart';
import '../../domain/entities/latest_audio_entity.dart';
import '../../domain/entities/quick_action_entity.dart';
import '../../../../core/services/firestore_service.dart';
import 'home_data_source.dart';

class FirebaseHomeDataSource implements HomeDataSource {
  final FirestoreService _firestoreService;

  FirebaseHomeDataSource(this._firestoreService);

  @override
  Future<HomeDashboardEntity> getHomeDashboard() async {
    final futures = await Future.wait([
      _firestoreService.queryCollection(
        FirestoreCollections.dailyQuotes,
        (ref) => ref.orderBy('createdAt', descending: true).limit(1), // Admin suvichar does not have 'active'
      ),
      _firestoreService.queryCollection(
        FirestoreCollections.banners,
        (ref) => ref.where('status', isEqualTo: 'published').orderBy('priority', descending: true), // Match Admin Banners
      ),
      _firestoreService.queryCollection(
        FirestoreCollections.categories,
        (ref) => ref.where('status', isEqualTo: 'active').where('showOnHome', isEqualTo: true).orderBy('homeOrder'),
      ),
      _firestoreService.queryCollection(
        FirestoreCollections.audio,
        (ref) => ref.orderBy('createdAt', descending: true).limit(5), // Fixed audio query to use createdAt
      ),
    ]);

    final quotesSnapshot = futures[0];
    final bannersSnapshot = futures[1];
    final categoriesSnapshot = futures[2];
    final audiosSnapshot = futures[3];

      DailyQuoteEntity? dailyQuote;
      if (quotesSnapshot.docs.isNotEmpty) {
        final doc = quotesSnapshot.docs.first.data() as Map<String, dynamic>;
        dailyQuote = DailyQuoteEntity(
          id: quotesSnapshot.docs.first.id,
          quoteText: doc['content'] ?? '', // Admin writes content
          author: doc['title'] ?? '', // Admin writes title
          imageUrl: doc['imageUrl'],
          date: (doc['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
        );
      }

      final banners = bannersSnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        
        String? targetRoute;
        final actionType = data['actionType'] as String?;
        final actionTarget = data['actionTarget'] as String?;
        
        if (actionType != null && actionTarget != null && actionTarget.isNotEmpty) {
          if (actionType == 'internal' || actionType == 'link') {
            targetRoute = actionTarget;
          } else if (actionType == 'bhajan') {
            targetRoute = '/audio/$actionTarget';
          } else if (actionType == 'book') {
            targetRoute = '/books/$actionTarget';
          } else if (actionType == 'category') {
            targetRoute = '/category/$actionTarget';
          }
        }
        
        return FeaturedBannerEntity(
          id: doc.id,
          title: data['title'] ?? '',
          imageUrl: data['imageUrl'] ?? '',
          targetRoute: targetRoute,
        );
      }).toList();

      final quickActions = categoriesSnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        return QuickActionEntity(
          id: doc.id,
          title: data['name'] ?? '',
          iconName: data['icon'] ?? 'star',
          route: data['route'] ?? '/',
        );
      }).toList();

      final latestAudios = audiosSnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        return LatestAudioEntity(
          id: doc.id,
          title: data['title'] ?? '',
          speaker: data['description'] ?? '',
          audioUrl: data['audioUrl'] ?? '',
          duration: Duration(minutes: data['durationMinutes'] ?? 0),
        );
      }).toList();

    return HomeDashboardEntity(
      notificationCount: 0,
      dailyQuote: dailyQuote,
      banners: banners,
      quickActions: quickActions,
      latestSatsangs: [],
      upcomingEvents: [],
      latestAudios: latestAudios,
      featuredBooks: [],
    );
  }
}
