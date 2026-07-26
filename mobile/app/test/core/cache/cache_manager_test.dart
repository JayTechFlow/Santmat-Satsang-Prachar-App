import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/cache/manager/cache_manager.dart';

void main() {
  test('CacheManager stores and retrieves values', () async {
    final cache = InMemoryCacheManager();
    await cache.put('key1', 'value1');
    final val = await cache.get<String>('key1');
    expect(val, 'value1');
  });
}
