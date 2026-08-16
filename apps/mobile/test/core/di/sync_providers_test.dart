import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/sync_providers.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/services/connectivity_service.dart';

class MockConnectivityService extends ConnectivityService {
  @override
  Stream<bool> get onConnectivityChanged => Stream.value(true);
}

void main() {
  test('Sync providers are registered correctly', () {
    final container = ProviderContainer(
      overrides: [
        connectivityServiceProvider.overrideWithValue(
          MockConnectivityService(),
        ),
      ],
    );
    expect(container.read(syncManagerProvider), isNotNull);
    container.dispose();
  });
}
