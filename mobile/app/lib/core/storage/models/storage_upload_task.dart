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
