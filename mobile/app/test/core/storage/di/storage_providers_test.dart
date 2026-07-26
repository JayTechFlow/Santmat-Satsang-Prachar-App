import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';

class _FakeStorageProvider implements StorageProvider {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  test('Storage Providers are registered correctly', () {
    final container = ProviderContainer(
      overrides: [storageProvider.overrideWithValue(_FakeStorageProvider())],
    );
    final provider = container.read(storageProvider);
    expect(provider, isA<StorageProvider>());

    final mediaUrlResolver = container.read(mediaUrlResolverProvider);
    expect(mediaUrlResolver, isNotNull);

    container.dispose();
  });
}
