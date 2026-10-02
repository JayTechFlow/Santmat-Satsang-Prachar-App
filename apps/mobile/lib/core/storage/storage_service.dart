import 'package:hive_flutter/hive_flutter.dart';

/// Application storage bootstrap.
///
/// `sharedPreferencesProvider`, `secureStorageProvider` and
/// `secureStorageServiceProvider` are defined once, in
/// `secure_storage_service.dart`, and re-exported here for convenience.
export 'secure_storage_service.dart'
    show
        secureStorageProvider,
        secureStorageServiceProvider,
        sharedPreferencesProvider;

/// Initializes the on-device storage backend.
class StorageService {
  static Future<void> init() async {
    await Hive.initFlutter();
  }
}
