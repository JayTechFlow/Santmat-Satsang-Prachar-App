import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/config/environment_configuration.dart';
import 'package:santmat_satsang_prachar/core/config/backend_configuration.dart';
import 'package:santmat_satsang_prachar/core/services/connectivity_service.dart';
import 'package:santmat_satsang_prachar/core/services/network_monitor_service.dart';
import 'package:santmat_satsang_prachar/core/services/firestore_service.dart';
import 'package:santmat_satsang_prachar/core/services/firebase_storage_service.dart';
import 'package:santmat_satsang_prachar/core/services/firebase_auth_service.dart';
import 'package:santmat_satsang_prachar/core/services/firebase_messaging_service.dart';
import 'package:santmat_satsang_prachar/core/services/firebase_analytics_service.dart';
import 'package:santmat_satsang_prachar/core/services/crashlytics_service.dart';
import 'package:santmat_satsang_prachar/core/services/remote_config_service.dart';
import 'package:santmat_satsang_prachar/core/services/cloud_functions_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  
  test('DI registers EnvironmentConfiguration', () {
    final container = ProviderContainer();
    final config = container.read(environmentConfigurationProvider);
    expect(config, isA<EnvironmentConfiguration>());
    expect(config.isDev, isTrue);
  });

  test('DI registers BackendConfiguration', () {
    final container = ProviderContainer();
    final config = container.read(backendConfigurationProvider);
    expect(config, isA<BackendConfiguration>());
    expect(config.apiBaseUrl, 'https://dev-api.example.com');
  });

  test('DI registers FirestoreService', () {
    final container = ProviderContainer();
    final service = container.read(firestoreServiceProvider);
    expect(service, isA<FirestoreService>());
  });

  test('DI registers FirebaseStorageService', () {
    final container = ProviderContainer();
    final service = container.read(firebaseStorageServiceProvider);
    expect(service, isA<FirebaseStorageService>());
  });

  test('DI registers FirebaseAuthService', () {
    final container = ProviderContainer();
    final service = container.read(firebaseAuthServiceProvider);
    expect(service, isA<FirebaseAuthService>());
  });

  test('DI registers FirebaseMessagingService', () {
    final container = ProviderContainer();
    final service = container.read(firebaseMessagingServiceProvider);
    expect(service, isA<FirebaseMessagingService>());
  });

  test('DI registers FirebaseAnalyticsService', () {
    final container = ProviderContainer();
    final service = container.read(firebaseAnalyticsServiceProvider);
    expect(service, isA<FirebaseAnalyticsService>());
  });

  test('DI registers CrashlyticsService', () {
    final container = ProviderContainer();
    final service = container.read(crashlyticsServiceProvider);
    expect(service, isA<CrashlyticsService>());
  });

  test('DI registers RemoteConfigService', () {
    final container = ProviderContainer();
    final service = container.read(remoteConfigServiceProvider);
    expect(service, isA<RemoteConfigService>());
  });

  test('DI registers CloudFunctionsService', () {
    final container = ProviderContainer();
    final service = container.read(cloudFunctionsServiceProvider);
    expect(service, isA<CloudFunctionsService>());
  });

  test('DI registers ConnectivityService', () {
    final container = ProviderContainer();
    final service = container.read(connectivityServiceProvider);
    expect(service, isA<ConnectivityService>());
  });

  test('DI registers NetworkMonitorService', () {
    final container = ProviderContainer();
    final service = container.read(networkMonitorServiceProvider);
    expect(service, isA<NetworkMonitorService>());
  });
}
