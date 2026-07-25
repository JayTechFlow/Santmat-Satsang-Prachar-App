import '../../../../core/utils/result.dart';
import '../entities/home_dashboard_entity.dart';
import '../repositories/home_repository.dart';

class GetHomeDashboardUseCase {
  final HomeRepository _repository;

  const GetHomeDashboardUseCase(this._repository);

  Future<Result<HomeDashboardEntity>> call() => _repository.getHomeDashboard();
}

class RefreshHomeDashboardUseCase {
  final HomeRepository _repository;

  const RefreshHomeDashboardUseCase(this._repository);

  Future<Result<HomeDashboardEntity>> call() => _repository.getHomeDashboard();
}
