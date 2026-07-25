import '../../../../core/utils/result.dart';
import '../entities/home_dashboard_entity.dart';

abstract class HomeRepository {
  Future<Result<HomeDashboardEntity>> getHomeDashboard();
}
