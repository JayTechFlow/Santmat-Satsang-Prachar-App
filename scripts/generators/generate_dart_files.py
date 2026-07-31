import os

base_path = 'lib/core/storage'

files = {
    'models/storage_metadata.dart': '''
class StorageMetadata {
  final String contentType;
  final int sizeBytes;
  final DateTime? timeCreated;
  final DateTime? updated;
  final Map<String, String> customMetadata;

  const StorageMetadata({
    this.contentType = 'application/octet-stream',
    this.sizeBytes = 0,
    this.timeCreated,
    this.updated,
    this.customMetadata = const {},
  });

  StorageMetadata copyWith({
    String? contentType,
    int? sizeBytes,
    DateTime? timeCreated,
    DateTime? updated,
    Map<String, String>? customMetadata,
  }) {
    return StorageMetadata(
      contentType: contentType ?? this.contentType,
      sizeBytes: sizeBytes ?? this.sizeBytes,
      timeCreated: timeCreated ?? this.timeCreated,
      updated: updated ?? this.updated,
      customMetadata: customMetadata ?? this.customMetadata,
    );
  }
}
''',
    'models/storage_upload_task.dart': '''
import 'dart:async';
import 'package:santmat_satsang_prachar/core/storage/models/storage_metadata.dart';

abstract class StorageUploadTask {
  Stream<double> get progress;
  Future<String> get downloadUrl;
  Future<StorageMetadata> get metadata;
  
  Future<void> pause();
  Future<void> resume();
  Future<void> cancel();
}
''',
    'models/storage_download_task.dart': '''
import 'dart:async';

abstract class StorageDownloadTask {
  Stream<double> get progress;
  
  Future<void> pause();
  Future<void> resume();
  Future<void> cancel();
}
''',
    'providers/storage_provider.dart': '''
import 'dart:io';
import 'dart:typed_data';
import 'package:santmat_satsang_prachar/core/storage/models/storage_metadata.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_upload_task.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_download_task.dart';

abstract class StorageProvider {
  Future<String> getDownloadUrl(String path);
  Future<StorageMetadata> getMetadata(String path);
  Future<void> deleteFile(String path);
  
  StorageUploadTask uploadFile(String path, File file, {StorageMetadata? metadata});
  StorageUploadTask uploadData(String path, Uint8List data, {StorageMetadata? metadata});
  
  StorageDownloadTask downloadFile(String path, File destination);
  Future<Uint8List?> downloadData(String path, {int maxSize = 10485760}); // 10MB default
}
''',
    'providers/firebase_storage_provider.dart': '''
import 'dart:io';
import 'dart:typed_data';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_metadata.dart' as app_meta;
import 'package:santmat_satsang_prachar/core/storage/models/storage_upload_task.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_download_task.dart';
import 'package:santmat_satsang_prachar/core/storage/exceptions/storage_exceptions.dart';

class FirebaseStorageProvider implements StorageProvider {
  final FirebaseStorage _storage;

  FirebaseStorageProvider({FirebaseStorage? storage}) : _storage = storage ?? FirebaseStorage.instance;

  @override
  Future<String> getDownloadUrl(String path) async {
    try {
      return await _storage.ref(path).getDownloadURL();
    } on FirebaseException catch (e) {
      throw StorageException.fromFirebaseException(e);
    } catch (e) {
      throw StorageException(e.toString());
    }
  }

  @override
  Future<app_meta.StorageMetadata> getMetadata(String path) async {
    try {
      final meta = await _storage.ref(path).getMetadata();
      return app_meta.StorageMetadata(
        contentType: meta.contentType ?? 'application/octet-stream',
        sizeBytes: meta.size ?? 0,
        timeCreated: meta.timeCreated,
        updated: meta.updated,
        customMetadata: meta.customMetadata ?? {},
      );
    } on FirebaseException catch (e) {
      throw StorageException.fromFirebaseException(e);
    } catch (e) {
      throw StorageException(e.toString());
    }
  }

  @override
  Future<void> deleteFile(String path) async {
    try {
      await _storage.ref(path).delete();
    } on FirebaseException catch (e) {
      throw StorageException.fromFirebaseException(e);
    } catch (e) {
      throw StorageException(e.toString());
    }
  }

  @override
  StorageUploadTask uploadFile(String path, File file, {app_meta.StorageMetadata? metadata}) {
    final ref = _storage.ref(path);
    final settableMetadata = metadata != null ? SettableMetadata(
      contentType: metadata.contentType,
      customMetadata: metadata.customMetadata,
    ) : null;
    
    final task = ref.putFile(file, settableMetadata);
    return FirebaseStorageUploadTask(task, ref);
  }

  @override
  StorageUploadTask uploadData(String path, Uint8List data, {app_meta.StorageMetadata? metadata}) {
    final ref = _storage.ref(path);
    final settableMetadata = metadata != null ? SettableMetadata(
      contentType: metadata.contentType,
      customMetadata: metadata.customMetadata,
    ) : null;
    
    final task = ref.putData(data, settableMetadata);
    return FirebaseStorageUploadTask(task, ref);
  }

  @override
  StorageDownloadTask downloadFile(String path, File destination) {
    final ref = _storage.ref(path);
    final task = ref.writeToFile(destination);
    return FirebaseStorageDownloadTask(task);
  }

  @override
  Future<Uint8List?> downloadData(String path, {int maxSize = 10485760}) async {
    try {
      return await _storage.ref(path).getData(maxSize);
    } on FirebaseException catch (e) {
      throw StorageException.fromFirebaseException(e);
    } catch (e) {
      throw StorageException(e.toString());
    }
  }
}

class FirebaseStorageUploadTask implements StorageUploadTask {
  final UploadTask _task;
  final Reference _ref;

  FirebaseStorageUploadTask(this._task, this._ref);

  @override
  Stream<double> get progress {
    return _task.snapshotEvents.map((event) {
      if (event.totalBytes == 0) return 0.0;
      return event.bytesTransferred / event.totalBytes;
    });
  }

  @override
  Future<String> get downloadUrl async {
    await _task;
    return await _ref.getDownloadURL();
  }

  @override
  Future<app_meta.StorageMetadata> get metadata async {
    await _task;
    final meta = await _ref.getMetadata();
    return app_meta.StorageMetadata(
      contentType: meta.contentType ?? 'application/octet-stream',
      sizeBytes: meta.size ?? 0,
      timeCreated: meta.timeCreated,
      updated: meta.updated,
      customMetadata: meta.customMetadata ?? {},
    );
  }

  @override
  Future<void> pause() async {
    await _task.pause();
  }

  @override
  Future<void> resume() async {
    await _task.resume();
  }

  @override
  Future<void> cancel() async {
    await _task.cancel();
  }
}

class FirebaseStorageDownloadTask implements StorageDownloadTask {
  final DownloadTask _task;

  FirebaseStorageDownloadTask(this._task);

  @override
  Stream<double> get progress {
    return _task.snapshotEvents.map((event) {
      if (event.totalBytes == 0) return 0.0;
      return event.bytesTransferred / event.totalBytes;
    });
  }

  @override
  Future<void> pause() async {
    await _task.pause();
  }

  @override
  Future<void> resume() async {
    await _task.resume();
  }

  @override
  Future<void> cancel() async {
    await _task.cancel();
  }
}
''',
    'utils/storage_path_builder.dart': '''
class StoragePathBuilder {
  static String profilePicture(String userId) => 'users/\$userId/profile_picture.jpg';
  static String bookCover(String bookId) => 'books/\$bookId/cover.jpg';
  static String bookPdf(String bookId) => 'books/\$bookId/content.pdf';
  static String audioThumbnail(String audioId) => 'audios/\$audioId/thumbnail.jpg';
  static String audioFile(String audioId) => 'audios/\$audioId/audio.mp3';
  static String eventBanner(String eventId) => 'events/\$eventId/banner.jpg';
  static String quoteImage(String quoteId) => 'quotes/\$quoteId/image.jpg';
  static String donationReceipt(String receiptId) => 'donations/receipts/\$receiptId.pdf';
  static String downloadableFile(String downloadId) => 'downloads/\$downloadId/file';
  
  static String thumbnail(String originalPath) {
    final parts = originalPath.split('.');
    if (parts.length > 1) {
      final ext = parts.removeLast();
      return '\${parts.join('.')}_thumb.\$ext';
    }
    return '\${originalPath}_thumb';
  }
}
''',
    'utils/storage_reference_factory.dart': '''
import 'package:santmat_satsang_prachar/core/storage/utils/storage_path_builder.dart';

class StorageReferenceFactory {
  // Can be extended to return robust reference objects containing bucket info if needed
  static String createProfileRef(String userId) => StoragePathBuilder.profilePicture(userId);
  static String createAudioRef(String audioId) => StoragePathBuilder.audioFile(audioId);
  static String createBookRef(String bookId) => StoragePathBuilder.bookPdf(bookId);
}
''',
    'resolvers/media_url_resolver.dart': '''
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
      final thumbPath = path.replaceAll(RegExp(r'\.([a-zA-Z0-9]+)\$'), '_thumb.\$1');
      return await _storageProvider.getDownloadUrl(thumbPath);
    } catch (_) {
      return resolveDownloadUrl(path); // Fallback
    }
  }
}
''',
    'resolvers/signed_url_resolver.dart': '''
import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';

class SignedUrlResolver {
  final StorageProvider _storageProvider;

  SignedUrlResolver(this._storageProvider);

  Future<String> getSignedUrl(String path, {Duration expiresIn = const Duration(hours: 1)}) async {
    // Standard Firebase Storage download URLs are practically permanent tokens.
    // Real signed URLs require Cloud Functions or Admin SDK.
    // This abstraction is prepared for standardizing future signed URL implementation.
    return await _storageProvider.getDownloadUrl(path);
  }
}
''',
    'cache/media_cache_manager.dart': '''
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';

class MediaCacheManager {
  final StorageProvider _storageProvider;

  MediaCacheManager(this._storageProvider);

  Future<File?> getCachedFile(String path) async {
    final cacheDir = await getTemporaryDirectory();
    final safePath = path.replaceAll('/', '_');
    final file = File('\${cacheDir.path}/\$safePath');
    
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
    final file = File('\${cacheDir.path}/\$safePath');
    
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
''',
    'validators/media_integrity_validator.dart': '''
import 'dart:io';
import 'package:crypto/crypto.dart';

class MediaIntegrityValidator {
  Future<bool> validateChecksum(File file, String expectedMd5) async {
    if (!await file.exists()) return false;
    
    final stream = file.openRead();
    final hash = await md5.bind(stream).first;
    final actualMd5 = hash.toString();
    
    return actualMd5 == expectedMd5;
  }
  
  Future<bool> validateSize(File file, int expectedSize) async {
    if (!await file.exists()) return false;
    final size = await file.length();
    return size == expectedSize;
  }
}
''',
    'exceptions/storage_exceptions.dart': '''
import 'package:firebase_core/firebase_core.dart';

class StorageException implements Exception {
  final String message;
  final String? code;

  StorageException(this.message, {this.code});

  factory StorageException.fromFirebaseException(FirebaseException e) {
    switch (e.code) {
      case 'object-not-found':
        return StorageException('File does not exist.', code: e.code);
      case 'unauthorized':
        return StorageException('User is not authorized to access this file.', code: e.code);
      case 'canceled':
        return StorageException('Upload/Download was canceled.', code: e.code);
      default:
        return StorageException(e.message ?? 'Unknown storage error occurred.', code: e.code);
    }
  }

  @override
  String toString() => 'StorageException(\$code): \$message';
}
'''
}

for rel_path, content in files.items():
    full_path = os.path.join(base_path, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\n')
