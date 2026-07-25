import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';

class FirebaseStorageService {
  final FirebaseStorage? _storageOverride;

  FirebaseStorageService({FirebaseStorage? storage}) 
      : _storageOverride = storage;

  FirebaseStorage get _storage => _storageOverride ?? FirebaseStorage.instance;

  Future<String> uploadFile(String path, File file) async {
    final ref = _storage.ref().child(path);
    final uploadTask = await ref.putFile(file);
    return await uploadTask.ref.getDownloadURL();
  }

  Future<String> getDownloadUrl(String path) async {
    return await _storage.ref().child(path).getDownloadURL();
  }

  Future<void> deleteFile(String path) async {
    await _storage.ref().child(path).delete();
  }
}
