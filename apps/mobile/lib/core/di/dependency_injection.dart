import 'package:flutter/foundation.dart';
import '../config/app_config.dart';
import '../logger/app_logger.dart';

class DependencyInjection {
  const DependencyInjection._();

  static bool _initialized = false;

  static Future<void> init() async {
    if (_initialized) return;
    _initialized = true;
    appLogger.i('Dependency Injection Initialized');
  }

  // Dev direct-entry (skip auth) is STRICTLY opt-in via:
  //   flutter run --dart-define=ENABLE_DEV_DIRECT_ENTRY=true
  // It is off by default in debug so the real auth flow stays reachable.
  static const bool _devDirectEntry = bool.fromEnvironment('ENABLE_DEV_DIRECT_ENTRY');

  static final overrides = [
    appConfigProvider.overrideWithValue(
      kReleaseMode
          ? AppConfig.production()
          : AppConfig.development(enableDevDirectEntry: _devDirectEntry),
    ),
  ];
}
