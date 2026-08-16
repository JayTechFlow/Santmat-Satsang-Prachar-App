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
