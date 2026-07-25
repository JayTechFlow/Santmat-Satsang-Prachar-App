import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../env/environment.dart';

class AppConfig {
  final Environment environment;
  final String appName;
  final String apiBaseUrl;

  const AppConfig({
    required this.environment,
    required this.appName,
    required this.apiBaseUrl,
  });

  factory AppConfig.development() {
    return const AppConfig(
      environment: Environment.development,
      appName: 'Santmat Satsang Prachar (Dev)',
      apiBaseUrl: 'https://api.dev.santmatsatsang.org',
    );
  }

  factory AppConfig.production() {
    return const AppConfig(
      environment: Environment.production,
      appName: 'Santmat Satsang Prachar',
      apiBaseUrl: 'https://api.santmatsatsang.org',
    );
  }
}

final appConfigProvider = Provider<AppConfig>((ref) {
  return AppConfig.development();
});
