import 'dart:io';
import 'dart:typed_data';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_metadata.dart'
    as app_meta;
import 'package:santmat_satsang_prachar/core/storage/models/storage_upload_task.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_download_task.dart';
import 'package:santmat_satsang_prachar/core/storage/exceptions/storage_exceptions.dart';

class FirebaseStorageProvider implements StorageProvider {
  final FirebaseStorage _storage;

  FirebaseStorageProvider({FirebaseStorage? storage})
    : _storage = storage ?? FirebaseStorage.instance;

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
  StorageUploadTask uploadFile(
    String path,
    File file, {
    app_meta.StorageMetadata? metadata,
  }) {
    final ref = _storage.ref(path);
    final settableMetadata = metadata != null
        ? SettableMetadata(
            contentType: metadata.contentType,
            customMetadata: metadata.customMetadata,
          )
        : null;

    final task = ref.putFile(file, settableMetadata);
    return FirebaseStorageUploadTask(task, ref);
  }

  @override
  StorageUploadTask uploadData(
    String path,
    Uint8List data, {
    app_meta.StorageMetadata? metadata,
  }) {
    final ref = _storage.ref(path);
    final settableMetadata = metadata != null
        ? SettableMetadata(
            contentType: metadata.contentType,
            customMetadata: metadata.customMetadata,
          )
        : null;

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
