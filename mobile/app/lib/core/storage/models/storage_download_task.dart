import 'dart:async';

abstract class StorageDownloadTask {
  Stream<double> get progress;

  Future<void> pause();
  Future<void> resume();
  Future<void> cancel();
}
