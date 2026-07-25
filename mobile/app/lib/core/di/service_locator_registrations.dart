import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/environment_configuration.dart';
import '../config/backend_configuration.dart';
import '../services/firestore_service.dart';
import '../services/firebase_storage_service.dart';
import '../services/firebase_auth_service.dart';
import '../services/firebase_messaging_service.dart';
import '../services/firebase_analytics_service.dart';
import '../services/crashlytics_service.dart';
import '../services/remote_config_service.dart';
import '../services/cloud_functions_service.dart';
import '../services/connectivity_service.dart';
import '../services/network_monitor_service.dart';

final environmentConfigurationProvider = Provider<EnvironmentConfiguration>((ref) {
  return const EnvironmentConfiguration(currentEnvironment: Environment.dev);
});

final backendConfigurationProvider = Provider<BackendConfiguration>((ref) {
  return BackendConfiguration(environment: ref.watch(environmentConfigurationProvider));
});

final firestoreServiceProvider = Provider<FirestoreService>((ref) {
  return FirestoreService();
});

final firebaseStorageServiceProvider = Provider<FirebaseStorageService>((ref) {
  return FirebaseStorageService();
});

final firebaseAuthServiceProvider = Provider<FirebaseAuthService>((ref) {
  return FirebaseAuthService();
});

final firebaseMessagingServiceProvider = Provider<FirebaseMessagingService>((ref) {
  return FirebaseMessagingService();
});

final firebaseAnalyticsServiceProvider = Provider<FirebaseAnalyticsService>((ref) {
  return FirebaseAnalyticsService();
});

final crashlyticsServiceProvider = Provider<CrashlyticsService>((ref) {
  return CrashlyticsService();
});

final remoteConfigServiceProvider = Provider<RemoteConfigService>((ref) {
  return RemoteConfigService();
});

final cloudFunctionsServiceProvider = Provider<CloudFunctionsService>((ref) {
  return CloudFunctionsService();
});

final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService();
});

final networkMonitorServiceProvider = Provider<NetworkMonitorService>((ref) {
  final service = NetworkMonitorService(ref.watch(connectivityServiceProvider));
  ref.onDispose(() => service.dispose());
  return service;
});

final isOnlineProvider = StreamProvider<bool>((ref) {
  final connectivity = ref.watch(connectivityServiceProvider);
  return connectivity.onConnectivityChanged;
});
