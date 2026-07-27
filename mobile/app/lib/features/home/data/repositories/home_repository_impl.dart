import '../../../../core/utils/result.dart';
import '../../domain/entities/home_dashboard_entity.dart';
import '../../domain/repositories/home_repository.dart';
import '../datasources/home_data_source.dart';

class HomeRepositoryImpl implements HomeRepository {
  final HomeDataSource _dataSource;

  HomeRepositoryImpl(this._dataSource);

  @override
  Future<Result<HomeDashboardEntity>> getHomeDashboard() async {
    try {
      final dashboard = await _dataSource.getHomeDashboard();
      return Result.success(dashboard);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
