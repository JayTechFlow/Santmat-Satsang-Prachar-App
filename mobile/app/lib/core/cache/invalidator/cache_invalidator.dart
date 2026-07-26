import '../manager/cache_manager.dart';

class CacheInvalidator {
  final CacheManager cacheManager;

  CacheInvalidator(this.cacheManager);

  Future<void> invalidate(String key) async {
    await cacheManager.remove(key);
  }

  Future<void> invalidateAll() async {
    await cacheManager.clear();
  }

  Future<void> invalidateExpired() async {
    await cacheManager.evictExpired();
  }
}
