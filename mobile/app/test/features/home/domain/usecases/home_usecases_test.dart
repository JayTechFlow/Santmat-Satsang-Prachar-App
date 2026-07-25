import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/home_dashboard_entity.dart';
import 'package:santmat_satsang_prachar/features/home/domain/repositories/home_repository.dart';
import 'package:santmat_satsang_prachar/features/home/domain/usecases/home_usecases.dart';

class MockHomeRepository implements HomeRepository {
  @override
  Future<Result<HomeDashboardEntity>> getHomeDashboard() async {
    return const Result.success(
      HomeDashboardEntity(
        notificationCount: 0,
        banners: [],
        quickActions: [],
        latestSatsangs: [],
        upcomingEvents: [],
        latestAudios: [],
        featuredBooks: [],
      ),
    );
  }
}

void main() {
  late MockHomeRepository repository;
  late GetHomeDashboardUseCase useCase;

  setUp(() {
    repository = MockHomeRepository();
    useCase = GetHomeDashboardUseCase(repository);
  });

  test('should get HomeDashboardEntity from repository', () async {
    final result = await useCase();
    expect(result.isSuccess, isTrue);
  });
}
