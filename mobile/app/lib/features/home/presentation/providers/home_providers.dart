import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../../data/datasources/home_data_source.dart';
import '../../data/datasources/firebase_home_data_source.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../domain/repositories/home_repository.dart';
import '../../domain/usecases/home_usecases.dart';
import 'home_notifier.dart';
import 'home_state.dart';

final homeDataSourceProvider = Provider<HomeDataSource>((ref) {
  return FirebaseHomeDataSource(FirebaseFirestore.instance);
});

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepositoryImpl(ref.watch(homeDataSourceProvider));
});

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
