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
        (ref) => ref.limit(10),
      ),
      _firestoreService.queryCollection(
        FirestoreCollections.banners,
        (ref) => ref.limit(10),
      ),
      _firestoreService.queryCollection(
        FirestoreCollections.categories,
        (ref) => ref.limit(10),
      ),
      _firestoreService.queryCollection(
        FirestoreCollections.audio,
        (ref) => ref.where('status', isEqualTo: 'प्रकाशित').limit(10),
      ),
    ]);

    final quotesSnapshot = futures[0];
    final bannersSnapshot = futures[1];
    final categoriesSnapshot = futures[2];
    final audiosSnapshot = futures[3];

    DateTime parseDate(dynamic raw) {
      if (raw is Timestamp) return raw.toDate();
      if (raw is String) return DateTime.tryParse(raw) ?? DateTime.now();
      return DateTime.now();
    }

    DailyQuoteEntity? dailyQuote;
    if (quotesSnapshot.docs.isNotEmpty) {
      final doc = quotesSnapshot.docs.first.data() as Map<String, dynamic>;
      dailyQuote = DailyQuoteEntity(
        id: quotesSnapshot.docs.first.id,
        quoteText: doc['content'] ?? '', // Admin writes content
        author: doc['title'] ?? '', // Admin writes title
        imageUrl: doc['imageUrl'],
        date: parseDate(doc['createdAt']),
      );
    }

    final banners = bannersSnapshot.docs
        .map((doc) {
          final data = doc.data() as Map<String, dynamic>;

          final isActive =
              (data['active'] as bool? ?? data['isActive'] as bool? ?? true);
          if (!isActive) return null;

          final imageUrl = data['imageUrl'] as String? ?? '';
          if (imageUrl.isEmpty) return null;

          String? targetRoute;
          final actionType = data['actionType'] as String?;
          final actionTarget = data['actionTarget'] as String?;

          if (actionType != null &&
              actionTarget != null &&
              actionTarget.isNotEmpty) {
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

          final rawSlot = data['slot'] ?? data['order'];
          int slot = 1;
          if (rawSlot is num) {
            if (data.containsKey('slot')) {
              slot = rawSlot.toInt();
            } else {
              slot = rawSlot.toInt() + 1;
            }
          }
          if (slot < 1 || slot > 4) slot = 1;

          return FeaturedBannerEntity(
            id: doc.id,
            title: data['title'] ?? '',
            imageUrl: imageUrl,
            targetRoute:
                targetRoute ?? (data['targetScreen'] as String?) ?? '/audio',
            slot: slot,
          );
        })
        .whereType<FeaturedBannerEntity>()
        .toList();

    // Deduplicate by slot (at most one banner per slot 1..4) and sort deterministically
    final Map<int, FeaturedBannerEntity> slotMap = {};
    for (final b in banners) {
      if (!slotMap.containsKey(b.slot)) {
        slotMap[b.slot] = b;
      }
    }
    final orderedBanners = slotMap.values.toList()
      ..sort((a, b) => a.slot.compareTo(b.slot));

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
      final durationSec = (data['durationSeconds'] as num?)?.toInt();
      final duration = durationSec != null
          ? Duration(seconds: durationSec)
          : Duration(minutes: data['durationMinutes'] ?? 0);
      return LatestAudioEntity(
        id: doc.id,
        title: data['title'] ?? '',
        speaker: data['description'] ?? '',
        audioUrl: data['audioUrl'] ?? '',
        duration: duration,
      );
    }).toList();

    return HomeDashboardEntity(
      notificationCount: 0,
      dailyQuote: dailyQuote,
      banners: orderedBanners,
      quickActions: quickActions,
      latestSatsangs: [],
      upcomingEvents: [],
      latestAudios: latestAudios,
      featuredBooks: [],
    );
  }
}
