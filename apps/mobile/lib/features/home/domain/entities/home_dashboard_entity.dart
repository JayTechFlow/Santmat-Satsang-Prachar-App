import 'daily_quote_entity.dart';
import 'featured_banner_entity.dart';
import 'featured_book_entity.dart';
import 'latest_audio_entity.dart';
import 'latest_satsang_entity.dart';
import 'quick_action_entity.dart';
import 'upcoming_event_entity.dart';

class HomeDashboardEntity {
  final int notificationCount;
  final DailyQuoteEntity? dailyQuote;
  final List<FeaturedBannerEntity> banners;
  final List<QuickActionEntity> quickActions;
  final List<LatestSatsangEntity> latestSatsangs;
  final List<UpcomingEventEntity> upcomingEvents;
  final List<LatestAudioEntity> latestAudios;
  final List<FeaturedBookEntity> featuredBooks;

  const HomeDashboardEntity({
    required this.notificationCount,
    this.dailyQuote,
    required this.banners,
    required this.quickActions,
    required this.latestSatsangs,
    required this.upcomingEvents,
    required this.latestAudios,
    required this.featuredBooks,
  });
}
