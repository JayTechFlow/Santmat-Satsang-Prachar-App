import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';

class MediaCacheManager {
  final StorageProvider _storageProvider;

  MediaCacheManager(this._storageProvider);

  Future<File?> getCachedFile(String path) async {
    final cacheDir = await getTemporaryDirectory();
    final safePath = path.replaceAll('/', '_');
    final file = File('${cacheDir.path}/$safePath');

    if (await file.exists()) {
      return file;
    }
    return null;
  }

  Future<File> downloadAndCache(String path) async {
    final cached = await getCachedFile(path);
    if (cached != null) return cached;

    final cacheDir = await getTemporaryDirectory();
    final safePath = path.replaceAll('/', '_');
    final file = File('${cacheDir.path}/$safePath');

    final task = _storageProvider.downloadFile(path, file);
    // Wait for completion (simple implementation)
    // In production, we'd listen to the task or use an awaitable mechanism
    // if the underlying provider supports it. We'll simulate await via stream completion.
    await task.progress.last;

    return file;
  }

  Future<void> clearCache() async {
    final cacheDir = await getTemporaryDirectory();
    if (await cacheDir.exists()) {
      await cacheDir.delete(recursive: true);
      await cacheDir.create();
    }
  }
}
