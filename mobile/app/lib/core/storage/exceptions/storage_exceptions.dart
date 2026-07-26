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
        return StorageException(
          'User is not authorized to access this file.',
          code: e.code,
        );
      case 'canceled':
        return StorageException('Upload/Download was canceled.', code: e.code);
      default:
        return StorageException(
          e.message ?? 'Unknown storage error occurred.',
          code: e.code,
        );
    }
  }

  @override
  String toString() => 'StorageException($code): $message';
}
