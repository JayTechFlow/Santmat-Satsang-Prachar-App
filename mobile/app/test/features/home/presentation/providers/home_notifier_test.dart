import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/home_dashboard_entity.dart';
import 'package:santmat_satsang_prachar/features/home/domain/usecases/home_usecases.dart';

import 'package:santmat_satsang_prachar/features/home/presentation/providers/home_providers.dart';

class MockGetHomeDashboardUseCase extends GetHomeDashboardUseCase {
  MockGetHomeDashboardUseCase(super.repository);

  @override
  Future<Result<HomeDashboardEntity>> call() async {
    return const Result.success(
      HomeDashboardEntity(
        notificationCount: 1,
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
  test('HomeNotifier fetchDashboard updates state to data', () async {
    final container = ProviderContainer(
      overrides: [
        getHomeDashboardUseCaseProvider.overrideWith(
          (ref) =>
              MockGetHomeDashboardUseCase(ref.read(homeRepositoryProvider)),
        ),
      ],
    );

    final state = container.read(homeStateProvider);
    expect(state.isLoading, isTrue);

    await container.read(homeStateProvider.notifier).fetchDashboard();

    final nextState = container.read(homeStateProvider);
    expect(nextState.hasValue, isTrue);
    expect(nextState.value?.notificationCount, 1);
  });
}
