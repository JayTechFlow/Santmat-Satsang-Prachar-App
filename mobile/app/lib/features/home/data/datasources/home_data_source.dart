import '../../domain/entities/home_dashboard_entity.dart';

abstract class HomeDataSource {
  Future<HomeDashboardEntity> getHomeDashboard();
}
