import 'package:santmat_satsang_prachar/features/home/data/datasources/home_data_source.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/featured_banner_entity.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/home_dashboard_entity.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/quick_action_entity.dart';

class MockHomeDataSource implements HomeDataSource {
  @override
  Future<HomeDashboardEntity> getHomeDashboard() async {
    await Future.delayed(const Duration(milliseconds: 800));
    return HomeDashboardEntity(
      notificationCount: 3,
      banners: [
        FeaturedBannerEntity(id: '1', title: 'Banner 1', imageUrl: 'https://picsum.photos/800/400'),
        FeaturedBannerEntity(id: '2', title: 'Banner 2', imageUrl: 'https://picsum.photos/800/401'),
      ],
      quickActions: [
        QuickActionEntity(id: '1', title: 'Satsang', iconName: 'satsang_icon', route: '/satsang'),
        QuickActionEntity(id: '2', title: 'Audio', iconName: 'audio_icon', route: '/audio'),
        QuickActionEntity(id: '3', title: 'Books', iconName: 'books_icon', route: '/library'),
        QuickActionEntity(id: '4', title: 'Events', iconName: 'events_icon', route: '/events'),
      ],
      latestSatsangs: [],
      upcomingEvents: [],
      latestAudios: [],
      featuredBooks: [],
    );
  }
}
