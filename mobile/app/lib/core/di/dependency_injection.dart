import '../config/app_config.dart';
import '../logger/app_logger.dart';

class DependencyInjection {
  const DependencyInjection._();

  static Future<void> init() async {
    appLogger.i('Dependency Injection Initialized');
  }

  static final overrides = [
    appConfigProvider.overrideWithValue(AppConfig.development()),
  ];
}
