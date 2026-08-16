import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'home_providers.dart';
import 'home_state.dart';

class HomeNotifier extends Notifier<HomeState> {
  @override
  HomeState build() {
    fetchDashboard();
    return const AsyncValue.loading();
  }

  Future<void> fetchDashboard() async {
    state = const AsyncValue.loading();
    final useCase = ref.read(getHomeDashboardUseCaseProvider);
    final result = await useCase.call();

    result.when(
      success: (data) {
        state = AsyncValue.data(data);
      },
      failure: (error) {
        state = AsyncValue.error(error, StackTrace.current);
      },
    );
  }

  Future<void> refreshDashboard() async {
    final useCase = ref.read(refreshHomeDashboardUseCaseProvider);
    final result = await useCase.call();

    result.when(
      success: (data) {
        state = AsyncValue.data(data);
      },
      failure: (error) {
        state = AsyncValue.error(error, StackTrace.current);
      },
    );
  }
}
