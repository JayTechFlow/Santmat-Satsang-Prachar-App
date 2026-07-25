enum Environment { dev, staging, prod }

class EnvironmentConfiguration {
  final Environment currentEnvironment;
  
  const EnvironmentConfiguration({
    this.currentEnvironment = Environment.dev,
  });

  bool get isDev => currentEnvironment == Environment.dev;
  bool get isStaging => currentEnvironment == Environment.staging;
  bool get isProd => currentEnvironment == Environment.prod;
  
  String get name => currentEnvironment.name;
}
