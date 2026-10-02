import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/environment_configuration.dart';
import '../config/backend_configuration.dart';
import '../services/firestore_service.dart';
import '../services/firebase_storage_service.dart';
import '../services/firebase_messaging_service.dart';
import '../services/firebase_analytics_service.dart';
import '../services/crashlytics_service.dart';
import '../services/remote_config_service.dart';
import '../services/cloud_functions_service.dart';
import '../services/connectivity_service.dart';
import '../services/network_monitor_service.dart';

// --- Function Imports ---
import '../functions/config/backend_api_configuration.dart';
import '../functions/client/cloud_function_client.dart';
import '../functions/services/callable_function_service.dart';
import '../functions/services/https_function_service.dart';

// --- Storage Imports ---
import '../storage/providers/storage_provider.dart';
import '../storage/providers/firebase_storage_provider.dart';
import '../storage/resolvers/media_url_resolver.dart';
import '../storage/resolvers/signed_url_resolver.dart';
import '../storage/cache/media_cache_manager.dart';
import '../storage/validators/media_integrity_validator.dart';

// Re-exported so DI consumers can resolve the secure-storage provider from the
// service locator module. The single definition lives in
// `../storage/secure_storage_service.dart`.
export '../storage/secure_storage_service.dart'
    show secureStorageServiceProvider;

final environmentConfigurationProvider = Provider<EnvironmentConfiguration>((
  ref,
) {
  return const EnvironmentConfiguration(currentEnvironment: Environment.prod);
});

final backendConfigurationProvider = Provider<BackendConfiguration>((ref) {
  return BackendConfiguration(
    environment: ref.watch(environmentConfigurationProvider),
  );
});

final firestoreServiceProvider = Provider<FirestoreService>((ref) {
  return FirestoreService();
});

final firebaseStorageServiceProvider = Provider<FirebaseStorageService>((ref) {
  return FirebaseStorageService();
});

final firebaseMessagingServiceProvider = Provider<FirebaseMessagingService>((
  ref,
) {
  return FirebaseMessagingService();
});

final firebaseAnalyticsServiceProvider = Provider<FirebaseAnalyticsService>((
  ref,
) {
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

// --- Function Providers ---
final backendApiConfigurationProvider = Provider<BackendApiConfiguration>((
  ref,
) {
  return const BackendApiConfiguration();
});

final cloudFunctionClientProvider = Provider<CloudFunctionClient>((ref) {
  return CloudFunctionClient(
    ref.watch(cloudFunctionsServiceProvider).functions,
    ref.watch(backendApiConfigurationProvider),
  );
});

final callableFunctionServiceProvider = Provider<CallableFunctionService>((
  ref,
) {
  return CallableFunctionService(ref.watch(cloudFunctionClientProvider));
});

final httpsFunctionServiceProvider = Provider<HttpsFunctionService>((ref) {
  return HttpsFunctionService(ref.watch(cloudFunctionClientProvider));
});

// --- Storage Providers ---

final storageProvider = Provider<StorageProvider>((ref) {
  // Can switch based on environmentConfigurationProvider if needed
  // For now we default to FirebaseStorageProvider
  return FirebaseStorageProvider();
});

final mediaUrlResolverProvider = Provider<MediaUrlResolver>((ref) {
  return MediaUrlResolver(ref.watch(storageProvider));
});

final signedUrlResolverProvider = Provider<SignedUrlResolver>((ref) {
  return SignedUrlResolver(ref.watch(storageProvider));
});

final mediaCacheManagerProvider = Provider<MediaCacheManager>((ref) {
  return MediaCacheManager(ref.watch(storageProvider));
});

final mediaIntegrityValidatorProvider = Provider<MediaIntegrityValidator>((
  ref,
) {
  return MediaIntegrityValidator();
});
