class CacheEntry<T> {
  final String key;
  final T data;
  final DateTime timestamp;
  final Duration? ttl;

  CacheEntry({
    required this.key,
    required this.data,
    required this.timestamp,
    this.ttl,
  });

  bool get isExpired {
    if (ttl == null) return false;
    return DateTime.now().difference(timestamp) > ttl!;
  }
}
