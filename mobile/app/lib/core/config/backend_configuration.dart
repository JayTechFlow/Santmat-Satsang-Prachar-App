import 'environment_configuration.dart';

class BackendConfiguration {
  final EnvironmentConfiguration environment;
  
  const BackendConfiguration({
    required this.environment,
  });

  String get apiBaseUrl {
    switch (environment.currentEnvironment) {
      case Environment.dev:
        return 'https://dev-api.example.com';
      case Environment.staging:
        return 'https://staging-api.example.com';
      case Environment.prod:
        return 'https://api.example.com';
    }
  }
}
