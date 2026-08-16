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

  static final overrides = [
    appConfigProvider.overrideWithValue(
      kReleaseMode ? AppConfig.production() : AppConfig.development(),
    ),
  ];
}
