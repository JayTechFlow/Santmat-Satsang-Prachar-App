import 'dart:async';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/featured_banner_entity.dart';
import '../../domain/entities/featured_book_entity.dart';
import '../../domain/entities/home_dashboard_entity.dart';
import '../../domain/entities/latest_audio_entity.dart';
import '../../domain/entities/latest_satsang_entity.dart';
import '../../domain/entities/quick_action_entity.dart';
import '../../domain/entities/upcoming_event_entity.dart';

class MockHomeDataSource {
  Future<HomeDashboardEntity> getHomeDashboard() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 800));

    return HomeDashboardEntity(
      notificationCount: 3,
      dailyQuote: DailyQuoteEntity(
        id: '1',
        quoteText:
            'Meditation is the key to unlock the doors of the inner world.',
        author: 'Maharshi Mehi Paramhans',
        date: DateTime.now(),
      ),
      banners: const [
        FeaturedBannerEntity(
          id: '1',
          title: 'Annual Satsang Mahasabha 2026',
          imageUrl: 'https://picsum.photos/seed/satsang/800/400',
        ),
        FeaturedBannerEntity(
          id: '2',
          title: 'New Spiritual Book Release',
          imageUrl: 'https://picsum.photos/seed/book/800/400',
        ),
      ],
      quickActions: const [
        QuickActionEntity(
          id: 'qa1',
          title: 'Daily Path',
          iconName: 'menu_book',
          route: '/path',
        ),
        QuickActionEntity(
          id: 'qa2',
          title: 'Donate',
          iconName: 'volunteer_activism',
          route: '/donate',
        ),
        QuickActionEntity(
          id: 'qa3',
          title: 'Live Satsang',
          iconName: 'live_tv',
          route: '/live',
        ),
        QuickActionEntity(
          id: 'qa4',
          title: 'Audio Bhajans',
          iconName: 'headphones',
          route: '/audio',
        ),
      ],
      latestSatsangs: [
        LatestSatsangEntity(
          id: 's1',
          title: 'The Path of Inner Light',
          speaker: 'Swami Vyasanand Ji Maharaj',
          date: DateTime.now().subtract(const Duration(days: 1)),
          thumbnailUrl: 'https://picsum.photos/seed/satsang1/400/225',
          videoUrl: 'dummy_url',
          duration: const Duration(minutes: 45),
        ),
        LatestSatsangEntity(
          id: 's2',
          title: 'Importance of Dhyan',
          speaker: 'Acharya Shri',
          date: DateTime.now().subtract(const Duration(days: 3)),
          thumbnailUrl: 'https://picsum.photos/seed/satsang2/400/225',
          videoUrl: 'dummy_url',
          duration: const Duration(minutes: 60),
        ),
      ],
      upcomingEvents: [
        UpcomingEventEntity(
          id: 'e1',
          title: 'Sunday Weekly Satsang',
          location: 'Kuppaghat Ashram, Bhagalpur',
          startDate: DateTime.now().add(const Duration(days: 2)),
          endDate: DateTime.now().add(const Duration(days: 2, hours: 3)),
        ),
        UpcomingEventEntity(
          id: 'e2',
          title: 'Dhyan Shivir',
          location: 'Haridwar Ashram',
          startDate: DateTime.now().add(const Duration(days: 10)),
          endDate: DateTime.now().add(const Duration(days: 12)),
        ),
      ],
      latestAudios: const [
        LatestAudioEntity(
          id: 'a1',
          title: 'Morning Bhajan',
          speaker: 'Ashram Choir',
          audioUrl: 'dummy',
          duration: Duration(minutes: 5),
        ),
        LatestAudioEntity(
          id: 'a2',
          title: 'Guru Mahima',
          speaker: 'Swami Ji',
          audioUrl: 'dummy',
          duration: Duration(minutes: 12),
        ),
      ],
      featuredBooks: const [
        FeaturedBookEntity(
          id: 'b1',
          title: 'Maharshi Mehi Padavali',
          author: 'Maharshi Mehi Paramhans',
          coverImageUrl: 'https://picsum.photos/seed/padavali/300/450',
        ),
        FeaturedBookEntity(
          id: 'b2',
          title: 'Satsang Yoga',
          author: 'Maharshi Mehi Paramhans',
          coverImageUrl: 'https://picsum.photos/seed/yoga/300/450',
        ),
      ],
    );
  }
}
