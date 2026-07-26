import '../models/cache_entry.dart';
import '../models/cache_policy.dart';

abstract class CacheManager {
  Future<void> put<T>(String key, T data, {Duration? ttl});
  Future<T?> get<T>(String key, {CachePolicy policy = CachePolicy.cacheFirst});
  Future<void> remove(String key);
  Future<void> clear();
  Future<void> evictExpired();
}

class InMemoryCacheManager implements CacheManager {
  final Map<String, CacheEntry<dynamic>> _cache = {};
  final int maxEntries;

  InMemoryCacheManager({this.maxEntries = 100});

  @override
  Future<void> put<T>(String key, T data, {Duration? ttl}) async {
    if (_cache.length >= maxEntries && !_cache.containsKey(key)) {
      _evictLRU();
    }
    _cache[key] = CacheEntry<T>(
      key: key,
      data: data,
      timestamp: DateTime.now(),
      ttl: ttl,
    );
  }

  @override
  Future<T?> get<T>(
    String key, {
    CachePolicy policy = CachePolicy.cacheFirst,
  }) async {
    if (policy == CachePolicy.networkOnly) return null;

    final entry = _cache[key];
    if (entry == null) return null;

    if (entry.isExpired) {
      _cache.remove(key);
      return null;
    }

    return entry.data as T?;
  }

  @override
  Future<void> remove(String key) async {
    _cache.remove(key);
  }

  @override
  Future<void> clear() async {
    _cache.clear();
  }

  @override
  Future<void> evictExpired() async {
    _cache.removeWhere((key, entry) => entry.isExpired);
  }

  void _evictLRU() {
    if (_cache.isEmpty) return;
    String? oldestKey;
    DateTime? oldestTime;

    _cache.forEach((key, entry) {
      if (oldestTime == null || entry.timestamp.isBefore(oldestTime!)) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey != null) {
      _cache.remove(oldestKey);
    }
  }
}
