import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';

class MediaUrlResolver {
  final StorageProvider _storageProvider;

  MediaUrlResolver(this._storageProvider);

  Future<String> resolveDownloadUrl(String path) async {
    // If it's already an http/https URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return await _storageProvider.getDownloadUrl(path);
  }

  Future<String> resolveThumbnailUrl(String path) async {
    // Basic logic for thumbnails, could resolve to a predefined thumbnail path
    // For now it falls back to the original if thumbnail isn't generated via extension
    try {
      final thumbPath = path.replaceAll(
        RegExp(r'\.([a-zA-Z0-9]+)$'),
        r'_thumb.$1',
      );
      return await _storageProvider.getDownloadUrl(thumbPath);
    } catch (_) {
      return resolveDownloadUrl(path); // Fallback
    }
  }
}
