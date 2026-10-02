import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../env/environment.dart';

class AppConfig {
  final Environment environment;
  final String appName;
  final String apiBaseUrl;
  final bool enableDevDirectEntry;

  const AppConfig({
    required this.environment,
    required this.appName,
    required this.apiBaseUrl,
    this.enableDevDirectEntry = false,
  });

  factory AppConfig.development({bool enableDevDirectEntry = false}) {
    return AppConfig(
      environment: Environment.development,
      appName: 'Santmat Satsang Prachar (Dev)',
      apiBaseUrl: 'https://api.dev.santmatsatsang.org',
      enableDevDirectEntry: enableDevDirectEntry,
    );
  }

  factory AppConfig.production() {
    return const AppConfig(
      environment: Environment.production,
      appName: 'Santmat Satsang Prachar',
      apiBaseUrl: 'https://api.santmatsatsang.org',
      enableDevDirectEntry: false,
    );
  }
}

final appConfigProvider = Provider<AppConfig>((ref) {
  return AppConfig.development();
});
