import 'package:santmat_satsang_prachar/core/storage/providers/storage_provider.dart';

class SignedUrlResolver {
  final StorageProvider _storageProvider;

  SignedUrlResolver(this._storageProvider);

  Future<String> getSignedUrl(
    String path, {
    Duration expiresIn = const Duration(hours: 1),
  }) async {
    // Standard Firebase Storage download URLs are practically permanent tokens.
    // Real signed URLs require Cloud Functions or Admin SDK.
    // This abstraction is prepared for standardizing future signed URL implementation.
    return await _storageProvider.getDownloadUrl(path);
  }
}
