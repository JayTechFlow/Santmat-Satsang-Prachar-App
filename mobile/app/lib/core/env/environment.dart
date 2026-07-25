enum Environment { development, staging, production }

extension EnvironmentExtension on Environment {
  bool get isDevelopment => this == Environment.development;
  bool get isStaging => this == Environment.staging;
  bool get isProduction => this == Environment.production;
}
