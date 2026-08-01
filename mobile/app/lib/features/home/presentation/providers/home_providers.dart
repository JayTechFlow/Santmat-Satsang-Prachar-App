import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/usecases/home_usecases.dart';
import 'home_notifier.dart';
import 'home_state.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final getHomeDashboardUseCaseProvider = Provider<GetHomeDashboardUseCase>((
  ref,
) {
  return GetHomeDashboardUseCase(ref.watch(homeRepositoryProvider));
});

final refreshHomeDashboardUseCaseProvider =
    Provider<RefreshHomeDashboardUseCase>((ref) {
      return RefreshHomeDashboardUseCase(ref.watch(homeRepositoryProvider));
    });

final homeStateProvider = NotifierProvider<HomeNotifier, HomeState>(() {
  return HomeNotifier();
});
