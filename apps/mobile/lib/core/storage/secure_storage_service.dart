import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('sharedPreferencesProvider must be overridden');
});

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// Keys for secure storage
class SecureStorageKeys {
  static const String accessToken = 'auth_access_token';
  static const String refreshToken = 'auth_refresh_token';
  static const String idToken = 'auth_id_token';
  static const String userId = 'auth_user_id';
  static const String biometricEnabled = 'auth_biometric_enabled';
  static const String fcmToken = 'fcm_token';
  static const String appCheckToken = 'app_check_token';
}

/// Secure storage service for sensitive data
class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService(this._storage);

  /// Store access token
  Future<void> setAccessToken(String token) async {
    await _storage.write(key: SecureStorageKeys.accessToken, value: token);
  }

  /// Get access token
  Future<String?> getAccessToken() async {
    return await _storage.read(key: SecureStorageKeys.accessToken);
  }

  /// Store refresh token
  Future<void> setRefreshToken(String token) async {
    await _storage.write(key: SecureStorageKeys.refreshToken, value: token);
  }

  /// Get refresh token
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: SecureStorageKeys.refreshToken);
  }

  /// Store ID token
  Future<void> setIdToken(String token) async {
    await _storage.write(key: SecureStorageKeys.idToken, value: token);
  }

  /// Get ID token
  Future<String?> getIdToken() async {
    return await _storage.read(key: SecureStorageKeys.idToken);
  }

  /// Store user ID
  Future<void> setUserId(String userId) async {
    await _storage.write(key: SecureStorageKeys.userId, value: userId);
  }

  /// Get user ID
  Future<String?> getUserId() async {
    return await _storage.read(key: SecureStorageKeys.userId);
  }

  /// Store biometric enabled preference
  Future<void> setBiometricEnabled(bool enabled) async {
    await _storage.write(
      key: SecureStorageKeys.biometricEnabled,
      value: enabled.toString(),
    );
  }

  /// Get biometric enabled preference
  Future<bool> getBiometricEnabled() async {
    final value = await _storage.read(key: SecureStorageKeys.biometricEnabled);
    return value == 'true';
  }

  /// Store FCM token
  Future<void> setFcmToken(String token) async {
    await _storage.write(key: SecureStorageKeys.fcmToken, value: token);
  }

  /// Get FCM token
  Future<String?> getFcmToken() async {
    return await _storage.read(key: SecureStorageKeys.fcmToken);
  }

  /// Store App Check token
  Future<void> setAppCheckToken(String token) async {
    await _storage.write(key: SecureStorageKeys.appCheckToken, value: token);
  }

  /// Get App Check token
  Future<String?> getAppCheckToken() async {
    return await _storage.read(key: SecureStorageKeys.appCheckToken);
  }

  /// Clear all authentication tokens
  Future<void> clearAuthTokens() async {
    await Future.wait([
      _storage.delete(key: SecureStorageKeys.accessToken),
      _storage.delete(key: SecureStorageKeys.refreshToken),
      _storage.delete(key: SecureStorageKeys.idToken),
      _storage.delete(key: SecureStorageKeys.userId),
      _storage.delete(key: SecureStorageKeys.fcmToken),
      _storage.delete(key: SecureStorageKeys.appCheckToken),
    ]);
  }

  /// Clear all secure storage
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  /// Check if auth tokens exist
  Future<bool> hasAuthTokens() async {
    final accessToken = await _storage.read(key: SecureStorageKeys.accessToken);
    return accessToken != null && accessToken.isNotEmpty;
  }
}

/// Provider for SecureStorageService
final secureStorageServiceProvider = Provider<SecureStorageService>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return SecureStorageService(storage);
});