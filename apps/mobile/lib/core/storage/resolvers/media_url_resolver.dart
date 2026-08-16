import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';

class _CachedUrlEntry {
  final String url;
  final DateTime expiresAt;

  _CachedUrlEntry(this.url, this.expiresAt);

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

class MediaUrlResolver {
  final StorageProvider _storageProvider;
  final Map<String, _CachedUrlEntry> _cache = {};

  MediaUrlResolver(this._storageProvider);

  /// Resolves storage path, gs:// URI, or HTTP URL to a playable/downloadable HTTP URL.
  /// Automatically refreshes signed URLs near expiration (within 5 minutes of default 1h expiry).
  Future<String> resolveDownloadUrl(
    String path, {
    bool forceRefresh = false,
  }) async {
    if (path.isEmpty) return '';

    // Direct HTTP/HTTPS or local File URIs
    if (path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('file://')) {
      return path;
    }

    // Clean up gs:// prefix if present
    String cleanPath = path;
    if (cleanPath.startsWith('gs://')) {
      final uri = Uri.parse(cleanPath);
      // Remove bucket from host if present, e.g. gs://bucket/folder/file.mp3 -> folder/file.mp3
      cleanPath = uri.path.startsWith('/') ? uri.path.substring(1) : uri.path;
    }

    if (!forceRefresh && _cache.containsKey(cleanPath)) {
      final cached = _cache[cleanPath]!;
      if (!cached.isExpired) {
        return cached.url;
      }
    }

    try {
      final url = await _storageProvider.getDownloadUrl(cleanPath);
      // Firebase Storage tokens are valid long-term, but signed URLs usually expire in ~1 hr.
      // We set local refresh window to 50 minutes.
      _cache[cleanPath] = _CachedUrlEntry(
        url,
        DateTime.now().add(const Duration(minutes: 50)),
      );
      return url;
    } catch (e) {
      // Fallback: If cleanPath failed, try original path string
      if (cleanPath != path) {
        final url = await _storageProvider.getDownloadUrl(path);
        _cache[path] = _CachedUrlEntry(
          url,
          DateTime.now().add(const Duration(minutes: 50)),
        );
        return url;
      }
      rethrow;
    }
  }

  /// Forces refreshing a signed URL for a path.
  Future<String> refreshUrl(String path) {
    return resolveDownloadUrl(path, forceRefresh: true);
  }

  /// Resolves thumbnail URL with fallback to standard download URL.
  Future<String> resolveThumbnailUrl(
    String path, {
    bool forceRefresh = false,
  }) async {
    if (path.isEmpty) return '';
    if (path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('file://')) {
      return path;
    }

    try {
      final thumbPath = path.replaceAll(
        RegExp(r'\.([a-zA-Z0-9]+)$'),
        r'_thumb.$1',
      );
      return await resolveDownloadUrl(thumbPath, forceRefresh: forceRefresh);
    } catch (_) {
      return resolveDownloadUrl(path, forceRefresh: forceRefresh);
    }
  }

  /// Evicts a path from the URL cache.
  void clearCacheForPath(String path) {
    _cache.remove(path);
  }

  /// Clears entire URL cache.
  void clearCache() {
    _cache.clear();
  }
}
