import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

class CrashlyticsService {
  final FirebaseCrashlytics? _crashlyticsOverride;

  CrashlyticsService({FirebaseCrashlytics? crashlytics})
    : _crashlyticsOverride = crashlytics;

  FirebaseCrashlytics get _crashlytics =>
      _crashlyticsOverride ?? FirebaseCrashlytics.instance;

  Future<void> initialize() async {
    FlutterError.onError = _crashlytics.recordFlutterFatalError;
    PlatformDispatcher.instance.onError = (error, stack) {
      _crashlytics.recordError(error, stack, fatal: true);
      return true;
    };
  }

  Future<void> recordError(
    dynamic exception,
    StackTrace? stack, {
    bool fatal = false,
  }) async {
    await _crashlytics.recordError(exception, stack, fatal: fatal);
  }

  Future<void> log(String message) async {
    await _crashlytics.log(message);
  }

  Future<void> setUserId(String identifier) async {
    await _crashlytics.setUserIdentifier(identifier);
  }

  Future<void> setCustomKey(String key, Object value) async {
    await _crashlytics.setCustomKey(key, value);
  }
}
