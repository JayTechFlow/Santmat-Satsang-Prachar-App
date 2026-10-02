import 'dart:io';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

enum ImagePickResultStatus {
  success,
  cancelled,
  permissionDenied,
  permissionPermanentlyDenied,
  error,
}

class ImagePickResult {
  final ImagePickResultStatus status;
  final File? file;
  final Uint8List? bytes;
  final String? errorMessage;

  const ImagePickResult({
    required this.status,
    this.file,
    this.bytes,
    this.errorMessage,
  });

  bool get isSuccess => status == ImagePickResultStatus.success && (file != null || bytes != null);
}

class ProfileImageService {
  final ImagePicker _picker;

  ProfileImageService({ImagePicker? picker}) : _picker = picker ?? ImagePicker();

  /// Picks an image from the specified [source] (Camera or Gallery)
  /// with thorough permission validation and graceful state reporting.
  Future<ImagePickResult> pickImage(ImageSource source) async {
    try {
      if (source == ImageSource.camera) {
        final cameraStatus = await Permission.camera.request();
        if (cameraStatus.isPermanentlyDenied) {
          return const ImagePickResult(
            status: ImagePickResultStatus.permissionPermanentlyDenied,
            errorMessage: 'कैमरा अनुमति स्थायी रूप से अस्वीकृत है। कृपया सेटिंग्स से अनुमति दें। (Camera permission permanently denied. Please enable in settings.)',
          );
        }
        if (cameraStatus.isDenied) {
          return const ImagePickResult(
            status: ImagePickResultStatus.permissionDenied,
            errorMessage: 'कैमरा अनुमति अस्वीकृत कर दी गई। (Camera permission denied.)',
          );
        }
      }

      final XFile? picked = await _picker.pickImage(
        source: source,
        maxWidth: 1200,
        maxHeight: 1200,
        imageQuality: 90,
      );

      if (picked == null) {
        return const ImagePickResult(status: ImagePickResultStatus.cancelled);
      }

      final bytes = await picked.readAsBytes();
      if (bytes.isEmpty) {
        return const ImagePickResult(
          status: ImagePickResultStatus.error,
          errorMessage: 'अमान्य फ़ाइल डेटा। (Invalid file data.)',
        );
      }

      return ImagePickResult(
        status: ImagePickResultStatus.success,
        file: File(picked.path),
        bytes: bytes,
      );
    } catch (e) {
      return ImagePickResult(
        status: ImagePickResultStatus.error,
        errorMessage: 'फ़ोटो चयन में त्रुटि: ${e.toString()}',
      );
    }
  }

  /// Crops and optimizes [rawBytes] into a 1:1 square avatar:
  /// - Normalizes EXIF orientation
  /// - Extracts square crop
  /// - Scales to controlled production size: [targetSize] (default 256x256 px)
  /// Pure in-memory square crop and 256x256 resizing logic.
  static Uint8List optimizeImageBytes({
    required Uint8List rawBytes,
    int targetSize = 256,
    int quality = 85,
    Rect? cropRectNorm,
  }) {
    final decoded = img.decodeImage(rawBytes);
    if (decoded == null) {
      throw Exception('फ़ोटो डिकोड नहीं की जा सकी (Unable to decode image)');
    }

    // Correct EXIF orientation so mobile camera portrait photos don't rotate
    final oriented = img.bakeOrientation(decoded);

    img.Image squareCropped;
    if (cropRectNorm != null) {
      final cropX = (cropRectNorm.left * oriented.width).round().clamp(0, oriented.width - 1);
      final cropY = (cropRectNorm.top * oriented.height).round().clamp(0, oriented.height - 1);
      final cropW = (cropRectNorm.width * oriented.width).round().clamp(1, oriented.width - cropX);
      final cropH = (cropRectNorm.height * oriented.height).round().clamp(1, oriented.height - cropY);

      // Force 1:1 square crop from the bounded selection
      final side = min(cropW, cropH);
      squareCropped = img.copyCrop(
        oriented,
        x: cropX,
        y: cropY,
        width: side,
        height: side,
      );
    } else {
      // Default center 1:1 square crop
      final minSide = min(oriented.width, oriented.height);
      final x = (oriented.width - minSide) ~/ 2;
      final y = (oriented.height - minSide) ~/ 2;
      squareCropped = img.copyCrop(
        oriented,
        x: x,
        y: y,
        width: minSide,
        height: minSide,
      );
    }

    // Resize to exact controlled default: 256x256 px
    final resized = img.copyResize(
      squareCropped,
      width: targetSize,
      height: targetSize,
      interpolation: img.Interpolation.average,
    );

    // Compress to JPEG with high visual fidelity and tiny file size (~25-50 KB)
    return img.encodeJpg(resized, quality: quality);
  }

  /// Crops and optimizes [rawBytes] into a 1:1 square avatar File:
  /// - Normalizes EXIF orientation
  /// - Extracts square crop
  /// - Scales to controlled production size: [targetSize] (default 256x256 px)
  /// - Compresses into lightweight JPEG
  /// - Ensures final size is well under 5 MB
  static Future<File> optimizeAvatar({
    required Uint8List rawBytes,
    int targetSize = 256,
    int quality = 85,
    Rect? cropRectNorm,
  }) async {
    final jpgBytes = optimizeImageBytes(
      rawBytes: rawBytes,
      targetSize: targetSize,
      quality: quality,
      cropRectNorm: cropRectNorm,
    );

    final tempDir = await getTemporaryDirectory();
    final tempFile = File(
      '${tempDir.path}/avatar_optimized_${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
    await tempFile.writeAsBytes(jpgBytes);

    return tempFile;
  }
}
