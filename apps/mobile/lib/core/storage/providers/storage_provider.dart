import 'dart:io';
import 'dart:typed_data';
import 'package:santmat_satsang_prachar/core/storage/models/storage_metadata.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_upload_task.dart';
import 'package:santmat_satsang_prachar/core/storage/models/storage_download_task.dart';

abstract class StorageProvider {
  Future<String> getDownloadUrl(String path);
  Future<StorageMetadata> getMetadata(String path);
  Future<void> deleteFile(String path);

  StorageUploadTask uploadFile(
    String path,
    File file, {
    StorageMetadata? metadata,
  });
  StorageUploadTask uploadData(
    String path,
    Uint8List data, {
    StorageMetadata? metadata,
  });

  StorageDownloadTask downloadFile(String path, File destination);
  Future<Uint8List?> downloadData(
    String path, {
    int maxSize = 10485760,
  }); // 10MB default
}
